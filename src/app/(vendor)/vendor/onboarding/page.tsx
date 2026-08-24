"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { authApi, vendorApi, type GstLookupData } from "@/lib/authApi";
import { isValidGstin } from "@/lib/gstin";
import { INDIAN_STATES, CITIES_BY_STATE } from "@/lib/indiaLocations";
import { BrandMark } from "@/components/BrandMark";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

type GstState = "idle" | "loading" | "verified" | "error";

/** Fields the GST registry can populate — tracked so we never clobber typed input. */
const GST_FIELDS = ["business_name", "address", "city", "state", "pincode"] as const;
type GstField = (typeof GST_FIELDS)[number];

const ALL_CITIES = Array.from(
  new Set(Object.values(CITIES_BY_STATE).flat())
).sort();

export default function VendorOnboarding() {
  const router = useRouter();
  const setVendorProfile = useStore((s) => s.setVendorProfile);
  const clearSession = useStore((s) => s.clearSession);

  const [form, setForm] = useState({
    full_name: "",
    gstin: "",
    business_name: "",
    email: "",
    description: "",
    address: "",
    city: "",
    state: "Madhya Pradesh",
    pincode: "",
  });

  const [gstState, setGstState] = useState<GstState>("idle");
  const [gstInfo, setGstInfo] = useState<GstLookupData | null>(null);
  const [gstError, setGstError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  /**
   * Which fields currently hold non-authored data (safe to overwrite on lookup).
   * `state` starts in here so the "Madhya Pradesh" convenience default doesn't
   * block a GST-sourced state, but still yields the moment the vendor edits it.
   */
  const autofilled = useRef<Set<GstField>>(new Set<GstField>(["state"]));

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    if (GST_FIELDS.includes(key as GstField)) {
      // The vendor took ownership of this field — stop auto-filling it.
      autofilled.current.delete(key as GstField);
    }
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  /** Editing the GSTIN invalidates any previous verification. */
  const setGstin = (raw: string) => {
    const gstin = raw.toUpperCase().replace(/\s/g, "").slice(0, 15);
    setForm((prev) => ({ ...prev, gstin }));
    if (gstInfo && gstInfo.gstin !== gstin) setGstInfo(null);
    if (gstState !== "idle" && (!isValidGstin(gstin) || gstInfo?.gstin !== gstin)) {
      setGstState("idle");
      setGstError("");
    }
  };

  /**
   * Going back to login has to end the session. The vendor is already
   * authenticated at this point, so the proxy would bounce a plain link to
   * /vendor/login straight to /vendor/dashboard — and the vendor layout would
   * send them back here for not being onboarded, making the link look dead.
   */
  const handleBackToLogin = async () => {
    setLeaving(true);
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Log out locally even if the token could not be blacklisted.
    }
    clearSession();
    router.replace("/vendor/login");
  };

  const gstinValid = isValidGstin(form.gstin);
  const hasGstin = form.gstin.trim().length > 0;

  const runLookup = useCallback(async (gstin: string) => {
    setGstState("loading");
    setGstError("");
    try {
      const data = await vendorApi.lookupGstin(gstin);
      setGstInfo(data);
      setGstState("verified");

      // Fill blank fields and refresh anything a previous lookup filled.
      setForm((prev) => {
        const next = { ...prev };
        const take = (field: GstField, value: string) => {
          if (!value) return;
          if (!prev[field].trim() || autofilled.current.has(field)) {
            next[field] = value;
            autofilled.current.add(field);
          }
        };
        take("business_name", data.business_name);
        take("address", data.address);
        take("city", data.city || data.district);
        take("state", data.state);
        take("pincode", data.pincode);
        // The registry does not publish contact details, but honour it if it ever does.
        if (data.email && !prev.email.trim()) next.email = data.email;
        return next;
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; detail?: string } } };
      setGstInfo(null);
      setGstState("error");
      setGstError(
        axiosErr.response?.data?.message ||
          axiosErr.response?.data?.detail ||
          "Could not verify this GSTIN. You can still fill the details manually."
      );
    }
  }, []);

  // Auto-verify as soon as a well-formed GSTIN is typed (debounced).
  useEffect(() => {
    const gstin = form.gstin.trim().toUpperCase();
    if (!isValidGstin(gstin) || gstInfo?.gstin === gstin) return;
    const timer = setTimeout(() => runLookup(gstin), 450);
    return () => clearTimeout(timer);
  }, [form.gstin, gstInfo?.gstin, runLookup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (hasGstin && !gstinValid) {
      setError("Enter a valid 15-character GSTIN (e.g. 23AAAAA1111A1Z1), or clear the field to continue without one.");
      return;
    }
    if (!form.business_name.trim() || !form.city.trim() || !form.address.trim()) {
      setError("Please complete your business name, address and city.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const pincode = form.pincode.trim();
      const address = form.address.trim();
      const profile = await vendorApi.onboard({
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        business_name: form.business_name.trim(),
        description: form.description.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim() || "Madhya Pradesh",
        address: pincode && !address.includes(pincode) ? `${address} - ${pincode}` : address,
        gstin: gstinValid ? form.gstin.trim().toUpperCase() : undefined,
      });
      setVendorProfile(profile);
      router.push("/vendor/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: { detail?: string; message?: string; error?: string; errors?: Record<string, string[]> };
        };
      };
      const errs = axiosErr.response?.data?.errors;
      if (errs) {
        const first = Object.entries(errs)[0];
        setError(`${first[0].replace(/_/g, " ")}: ${first[1][0]}`);
      } else {
        setError(
          axiosErr.response?.data?.detail ||
            axiosErr.response?.data?.message ||
            axiosErr.response?.data?.error ||
            "Onboarding failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = CITIES_BY_STATE[form.state] || ALL_CITIES;

  return (
    <div className="console-auth font-body py-10 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        {/* Brand */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2">
            <BrandMark size="md" tone="dark" />
            <span className="text-[10px] bg-[#F4F5F7] border border-[#EAECF0] text-[#667085] px-1.5 py-0.5 rounded font-mono">
              Vendor
            </span>
          </Link>
          <button
            type="button"
            onClick={handleBackToLogin}
            disabled={leaving}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-gold transition-colors disabled:opacity-60"
          >
            <ArrowLeft size={13} /> {leaving ? "Signing out…" : "Back to login"}
          </button>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ── Aside: what happens next ─────────────────────────── */}
          <aside className="console-card rounded-2xl p-6 space-y-6 lg:sticky lg:top-10">
            <div>
              <span className="eyebrow">Step 1 of 1</span>
              <h1 className="font-heading text-2xl font-semibold mt-1.5 leading-tight">Business Setup</h1>
              <p className="text-xs text-[#667085] mt-2 leading-relaxed">
                Tell us who you are and where you operate. You&apos;ll add your services and pricing right
                after this.
              </p>
            </div>

            <div className="h-px bg-[#EAECF0]" />

            <ul className="space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "GST auto-fill",
                  body: "Enter your GSTIN and we pull your registered business name and address straight from the GST registry.",
                },
                {
                  icon: BadgeCheck,
                  title: "Admin review",
                  body: "Your profile goes under review after submission. You can use your dashboard while you wait.",
                },
                {
                  icon: Sparkles,
                  title: "Then go live",
                  body: "Add listings, set pricing and start receiving booking enquiries from couples.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-gold/12 border border-gold/25 text-gold flex items-center justify-center">
                    <Icon size={14} />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#101828]">{title}</p>
                    <p className="text-[11px] text-[#667085] leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── Form ─────────────────────────────────────────────── */}
          <div className="console-card rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  <ShieldAlert size={14} className="shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}

              {/* Owner */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-gold" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#475467]">Owner details</h2>
                  <div className="flex-grow h-px bg-[#EAECF0]" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="full_name" className="field-label-light">
                    Owner&apos;s full name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="field-light"
                  />
                </div>
              </section>

              {/* GST */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <ScrollText size={13} className="text-gold" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#475467]">GST registration</h2>
                  <span className="text-[10px] font-semibold text-[#98A2B3] border border-[#EAECF0] bg-[#F9FAFB] rounded-full px-2 py-0.5">
                    Optional
                  </span>
                  <div className="flex-grow h-px bg-[#EAECF0]" />
                </div>

                <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-4 space-y-3">
                  <p className="text-[11px] text-[#475467] leading-relaxed">
                    Have a GSTIN? Enter it and we&apos;ll fetch your registered business name and address
                    automatically. No GSTIN? Just skip this and fill the details yourself.
                  </p>

                  <div className="space-y-1.5">
                    <label htmlFor="gstin" className="field-label-light">GSTIN</label>
                    <div className="relative">
                      <input
                        id="gstin"
                        type="text"
                        value={form.gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="23AAAAA1111A1Z1"
                        maxLength={15}
                        autoComplete="off"
                        spellCheck={false}
                        className="field-light font-mono tracking-[0.14em] pr-11 uppercase"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {gstState === "loading" && <Loader2 size={15} className="animate-spin text-gold" />}
                        {gstState === "verified" && <CheckCircle2 size={15} className="text-emerald-400" />}
                        {gstState === "error" && <ShieldAlert size={15} className="text-red-400" />}
                      </span>
                    </div>

                    {hasGstin && !gstinValid && (
                      <p className="text-[10px] text-amber-400">
                        A GSTIN is 15 characters — {form.gstin.trim().length}/15 entered.
                      </p>
                    )}
                    {gstState === "loading" && (
                      <p className="text-[10px] text-[#667085]">Checking the GST registry…</p>
                    )}
                    {gstState === "error" && (
                      <p className="text-[10px] text-red-400 flex items-center gap-2">
                        {gstError}
                        <button
                          type="button"
                          onClick={() => runLookup(form.gstin.trim().toUpperCase())}
                          className="underline font-semibold hover:text-red-300"
                        >
                          Retry
                        </button>
                      </p>
                    )}
                  </div>

                  {gstState === "verified" && gstInfo && (
                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 space-y-2 animate-fade-in-scale">
                      <p className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> GSTIN verified — details filled in below
                      </p>
                      <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        {[
                          ["Legal name", gstInfo.legal_name],
                          ["Status", gstInfo.status],
                          ["Constitution", gstInfo.constitution],
                          ["Registered since", gstInfo.registration_date],
                        ]
                          .filter(([, value]) => Boolean(value))
                          .map(([label, value]) => (
                            <div key={label} className="flex gap-1.5 min-w-0">
                              <dt className="text-emerald-400/70 shrink-0">{label}:</dt>
                              <dd className="text-emerald-100 truncate">{value}</dd>
                            </div>
                          ))}
                      </dl>
                      <p className="text-[10px] text-emerald-400/70">
                        Everything below stays editable — correct anything that looks off.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Business */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-gold" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#475467]">Business details</h2>
                  <div className="flex-grow h-px bg-[#EAECF0]" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="business_name" className="field-label-light">
                    <Building2 size={10} className="text-gold" /> Business name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="business_name"
                    type="text"
                    required
                    value={form.business_name}
                    onChange={(e) => set("business_name", e.target.value)}
                    placeholder="e.g. Royal Gardens & Banquets"
                    className="field-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="field-label-light">
                    <Mail size={10} className="text-gold" /> Business email
                    <span className="normal-case tracking-normal font-medium text-[#98A2B3]">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="contact@business.com"
                    className="field-light"
                  />
                  {gstState === "verified" && !form.email.trim() && (
                    <p className="text-[10px] text-[#98A2B3]">
                      The GST registry doesn&apos;t publish contact emails — add yours so couples can reach you.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="field-label-light">
                    <FileText size={10} className="text-gold" /> Description
                    <span className="normal-case tracking-normal font-medium text-[#98A2B3]">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe your services, specialities, capacity…"
                    className="field-light resize-none"
                  />
                </div>
              </section>

              {/* Address */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-gold" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#475467]">Business address</h2>
                  <div className="flex-grow h-px bg-[#EAECF0]" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address" className="field-label-light">
                    Full address <span className="text-gold">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Building, street, landmark, area"
                    className="field-light"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="state" className="field-label-light">State</label>
                    <input
                      id="state"
                      list="onboarding-states"
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      placeholder="Madhya Pradesh"
                      className="field-light"
                    />
                    <datalist id="onboarding-states">
                      {INDIAN_STATES.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="city" className="field-label-light">
                      City <span className="text-gold">*</span>
                    </label>
                    <input
                      id="city"
                      list="onboarding-cities"
                      required
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="e.g. Bhopal"
                      className="field-light"
                    />
                    <datalist id="onboarding-cities">
                      {cityOptions.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pincode" className="field-label-light">
                      Pincode
                      <span className="normal-case tracking-normal font-medium text-[#98A2B3]">(optional)</span>
                    </label>
                    <input
                      id="pincode"
                      inputMode="numeric"
                      value={form.pincode}
                      onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="462001"
                      maxLength={6}
                      className="field-light font-mono tracking-wider"
                    />
                  </div>
                </div>
              </section>

              {/* Submit */}
              <div className="space-y-4 pt-1">
                <p className="text-[11px] text-[#98A2B3] leading-relaxed">
                  Your profile goes under admin review once submitted. You&apos;ll be notified on approval and
                  can access your dashboard in the meantime.
                </p>

                <button
                  type="submit"
                  disabled={loading || gstState === "loading"}
                  className="btn-gold-glossy w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      Complete Registration <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-[#98A2B3]">
                  Want to finish this later?{" "}
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={leaving}
                    className="text-gold font-semibold hover:underline underline-offset-2 inline-flex items-center gap-1 disabled:opacity-60"
                  >
                    <ArrowLeft size={11} /> {leaving ? "Signing out…" : "Back to login"}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
