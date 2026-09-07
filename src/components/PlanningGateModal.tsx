"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CalendarDays, Check, ChevronLeft, Loader2, Lock, MapPin,
  Palette, Smartphone, User, Users, X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/store/store";
import { CITIES_BY_STATE } from "@/lib/indiaLocations";
import {
  DECORATION_STYLES, DISCOVERY_TARGETS, DJ_TIERS, briefToListingUrl,
  normalisePhone, todayISO,
  type DiscoveryBrief, type DiscoveryKind,
} from "@/lib/discovery";

const ALL_CITIES = Array.from(new Set(Object.values(CITIES_BY_STATE).flat())).sort();

const GUEST_PRESETS = [150, 300, 500, 800, 1200];

type Step = "phone" | "otp" | "brief";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /**
   * "discovery" (default) collects a city/date/guests brief after sign-in and
   * routes to the matching listing. "login" stops as soon as the number is
   * verified — used by the navbar's Log in button.
   */
  mode?: "discovery" | "login";
  /** Which listing the brief resolves to once the gate is cleared. */
  kind: DiscoveryKind;
  /** Pre-fill from wherever the modal was opened (a venue page, the hero…). */
  initialBrief?: Partial<DiscoveryBrief>;
  /**
   * Called instead of navigating. Use when the caller wants to stay on the page
   * and act on the brief itself (e.g. unlocking a quote on a venue page).
   */
  onComplete?: (brief: DiscoveryBrief) => void;
  title?: string;
  subtitle?: string;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
}

function apiMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) return fallback;
  const errors = data.errors as Record<string, string[]> | undefined;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
  }
  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.detail === "string") return data.detail;
  return fallback;
}

/**
 * The single gate every discovery entry point runs through: verify the phone
 * with an OTP and capture a name if we don't have one, then collect the three
 * things every listing filter needs — city, date, guest count.
 *
 * A signed-in customer skips straight to the brief.
 */
export default function PlanningGateModal({ isOpen, ...props }: Props) {
  // Mounting fresh is what resets the dialog — no reset-on-open effect, and no
  // stale OTP digits from a previous attempt.
  if (!isOpen) return null;
  return <GateDialog {...props} />;
}

function GateDialog({
  onClose, kind, initialBrief, onComplete, title, subtitle, mode = "discovery",
}: Omit<Props, "isOpen">) {
  const router = useRouter();
  const storeToken = useStore((s) => s.token);
  const storeUser = useStore((s) => s.user);
  const setToken = useStore((s) => s.setToken);
  const setUser = useStore((s) => s.setUser);
  const setOnboardingField = useStore((s) => s.setOnboardingField);

  const target = DISCOVERY_TARGETS[kind];

  // A signed-in customer skips the phone/OTP steps entirely.
  const signedIn = !!(
    storeToken ||
    readCookie("access_token") ||
    (typeof window !== "undefined" && localStorage.getItem("access_token"))
  );

  const [step, setStep] = useState<Step>(signedIn ? "brief" : "phone");
  const loginOnly = mode === "login";
  const [phone, setPhone] = useState(() => normalisePhone(storeUser?.phone || ""));
  const [fullName, setFullName] = useState(storeUser?.full_name || "");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [brief, setBrief] = useState<DiscoveryBrief>({
    city: initialBrief?.city || "Bhopal",
    date: initialBrief?.date || "",
    guests: initialBrief?.guests || 300,
    theme: initialBrief?.theme || "",
    tier: initialBrief?.tier || "",
  });

  // Close on Escape, and lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const otpValue = otp.join("");
  const phoneValid = phone.length === 10;

  const handleSendOtp = async () => {
    if (!phoneValid) {
      setError("Enter your 10-digit mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/otp/send/", { phone });
      setDevOtp(data?.data?.dev_otp ?? null);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    } catch (err) {
      setError(apiMessage(err, "Could not send the OTP. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 4) {
      setError("Enter the 4-digit code we sent you.");
      return;
    }
    if (!fullName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/otp/verify/", {
        phone,
        otp_code: otpValue,
        full_name: fullName.trim(),
      });
      const payload = data?.data ?? data;
      if (payload?.access) {
        localStorage.setItem("access_token", payload.access);
        if (payload.refresh) localStorage.setItem("refresh_token", payload.refresh);
        // The route guard in proxy.ts reads these cookies, not localStorage.
        document.cookie = `access_token=${payload.access}; path=/; max-age=86400`;
        document.cookie = "user_role=customer; path=/; max-age=86400";
        setToken(payload.access, "customer");
      }
      if (payload?.user) setUser(payload.user);
      setOnboardingField("phone", phone);
      setOnboardingField("otpVerified", true);
      if (loginOnly) {
        onClose();
        return;
      }
      setStep("brief");
    } catch (err) {
      setError(apiMessage(err, "That code didn't match. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleShowResults = () => {
    setOnboardingField("location", brief.city);
    setOnboardingField("guests", brief.guests);
    if (onComplete) {
      onComplete(brief);
    } else {
      router.push(briefToListingUrl(kind, brief));
    }
    onClose();
  };

  const handleOtpChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const stepMeta = useMemo(() => {
    if (step === "phone") {
      return { n: 1, label: "Verify your number", icon: Lock };
    }
    if (step === "otp") {
      return { n: 2, label: "Enter the code", icon: Smartphone };
    }
    return { n: 3, label: "Tell us about your event", icon: CalendarDays };
  }, [step]);

  const StepIcon = stepMeta.icon;
  const totalSteps = loginOnly ? 2 : signedIn ? 1 : 3;
  const shownStep = totalSteps === 1 ? 1 : stepMeta.n;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-[#050D1A]/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || target.label}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="relative shrink-0 px-5 pt-5 pb-4 bg-[#050D1A] text-white">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>

          <div className="flex items-center gap-2.5 pr-10">
            <span className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 text-gold flex items-center justify-center shrink-0">
              <StepIcon size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gold">
                {title || target.label}
              </p>
              <h2 className="text-[15px] font-semibold leading-tight truncate">
                {stepMeta.label}
              </h2>
            </div>
          </div>

          {/* Step rail */}
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < shownStep ? "bg-gold" : "bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex-grow overflow-y-auto px-5 py-5 space-y-4">

          {/* Step 1 — phone */}
          {step === "phone" && (
            <>
              <p className="text-xs text-gray-500 leading-relaxed">
                {subtitle ||
                  "We verify every enquiry so vendors only get real leads — and so we can send your quote and availability straight to your phone."}
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Mobile number
                </label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 focus-within:border-gold focus-within:bg-white transition-colors">
                  <span className="flex items-center gap-1.5 pl-3 pr-2 py-3 text-xs font-semibold text-gray-500 border-r border-gray-200">
                    <Smartphone size={13} className="text-gold" /> +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    className="flex-grow bg-transparent px-3 py-3 text-sm text-gray-900 tracking-wide outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2 — OTP + name */}
          {step === "otp" && (
            <>
              <p className="text-xs text-gray-500">
                Code sent to <strong className="text-gray-900">+91 {phone}</strong>.{" "}
                <button
                  onClick={() => setStep("phone")}
                  className="text-gold font-semibold hover:underline"
                >
                  Change
                </button>
              </p>

              <div className="flex justify-center gap-2.5 py-1">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    className="w-12 h-14 text-center text-xl font-bold text-gray-900 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gold focus:bg-white transition-colors"
                  />
                ))}
              </div>

              {devOtp && (
                <p className="text-center text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-1.5">
                  Dev mode — your code is <strong>{devOtp}</strong>
                </p>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Your name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Aarti Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-gold focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3 — the brief */}
          {step === "brief" && (
            <>
              <p className="text-xs text-gray-500 leading-relaxed">{target.blurb}</p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Where is the wedding?
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                  <select
                    value={brief.city}
                    onChange={(e) => setBrief({ ...brief, city: e.target.value })}
                    className="w-full pl-9 pr-8 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-gold focus:bg-white appearance-none cursor-pointer transition-colors"
                  >
                    {ALL_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Event date
                </label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                  <input
                    type="date"
                    min={todayISO()}
                    value={brief.date}
                    onChange={(e) => setBrief({ ...brief, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-gold focus:bg-white [color-scheme:light] cursor-pointer transition-colors"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave blank if the date isn&apos;t fixed — we&apos;ll show everything.
                </p>
              </div>

              {/*
                The third question depends on the service. A head count drives
                venue capacity and per-plate catering, but tells a decorator or
                a DJ nothing — they're chosen on style and setup level, and both
                are optional because a couple is usually still deciding.
              */}
              {kind === "decoration" ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Theme <span className="font-medium normal-case tracking-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Palette size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                    <select
                      value={brief.theme || ""}
                      onChange={(e) => setBrief({ ...brief, theme: e.target.value })}
                      className="w-full pl-9 pr-8 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-gold focus:bg-white appearance-none cursor-pointer transition-colors"
                    >
                      <option value="">Any theme — show me everything</option>
                      {DECORATION_STYLES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Not sure yet? Leave it — you can browse every style.
                  </p>
                </div>
              ) : kind === "dj" ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Setup level <span className="font-medium normal-case tracking-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBrief({ ...brief, tier: "" })}
                      className={`text-left px-3 py-2 rounded-xl border transition-all ${
                        !brief.tier ? "border-gold bg-gold/5 shadow-sm" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="block text-[11px] font-semibold text-gray-900">Any setup</span>
                      <span className="block text-[10px] text-gray-400">Show me everything</span>
                    </button>
                    {DJ_TIERS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setBrief({ ...brief, tier: t.value })}
                        className={`text-left px-3 py-2 rounded-xl border transition-all ${
                          brief.tier === t.value
                            ? "border-gold bg-gold/5 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="block text-[11px] font-semibold text-gray-900">{t.label}</span>
                        <span className="block text-[10px] text-gray-400">{t.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    How many guests?
                  </label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={brief.guests || ""}
                      onChange={(e) => setBrief({ ...brief, guests: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-gold focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {GUEST_PRESETS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setBrief({ ...brief, guests: g })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          brief.guests === g
                            ? "bg-[#050D1A] text-white border-[#050D1A]"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gold/50 hover:text-gray-900"
                        }`}
                      >
                        {g.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center gap-2">
          {step === "otp" && (
            <button
              onClick={() => setStep("phone")}
              className="w-11 h-11 shrink-0 rounded-xl border border-gray-200 bg-white text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <button
            onClick={
              step === "phone" ? handleSendOtp : step === "otp" ? handleVerifyOtp : handleShowResults
            }
            disabled={busy || (step === "phone" && !phoneValid)}
            className="btn-gold flex-grow justify-center rounded-xl py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : step === "phone" ? (
              <>Send OTP <ArrowRight size={15} /></>
            ) : step === "otp" ? (
              <>{loginOnly ? "Verify & log in" : "Verify & continue"} <Check size={15} /></>
            ) : (
              <>Show me {target.label.split(" ")[0].toLowerCase() === "venue" ? "venues" : "matches"} <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
