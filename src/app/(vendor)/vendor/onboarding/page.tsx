"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { vendorApi, type VendorType } from "@/lib/authApi";
import { ClipboardList, ArrowRight, ShieldAlert, Check, MapPin, Building2, User, Mail, Tag, FileText } from "lucide-react";

const VENDOR_TYPES: { value: VendorType; label: string; icon: string }[] = [
  { value: "venue",        label: "Venue",          icon: "🏛️" },
  { value: "decorator",   label: "Decorator",       icon: "🌸" },
  { value: "caterer",     label: "Caterer",         icon: "🍽️" },
  { value: "dj",          label: "DJ & Sound",      icon: "🎵" },
  { value: "planner",     label: "Planner",         icon: "📋" },
  { value: "photographer",label: "Photographer",    icon: "📷" },
  { value: "outfit",      label: "Outfit",          icon: "👗" },
  { value: "makeup",      label: "Makeup",          icon: "💄" },
  { value: "other",       label: "Other",           icon: "🏷️" },
];

const MP_CITIES = [
  "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain",
  "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
];

const STATES = [
  "Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh",
  "Gujarat", "Delhi", "Karnataka", "Tamil Nadu",
];

export default function VendorOnboarding() {
  const router = useRouter();
  const setVendorProfile = useStore((s) => s.setVendorProfile);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    vendor_type: "venue" as VendorType,
    business_name: "",
    description: "",
    city: "Bhopal",
    state: "Madhya Pradesh",
    address: "",
    gstin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.business_name.trim() || !form.city.trim()) {
      setError("Full name, business name, and city are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const profile = await vendorApi.onboard({
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        vendor_type: form.vendor_type,
        business_name: form.business_name.trim(),
        description: form.description.trim() || undefined,
        city: form.city,
        state: form.state,
        address: form.address.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
      });
      setVendorProfile(profile);
      router.push("/vendor/profile");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string; errors?: Record<string, string[]> } };
      };
      const errs = axiosErr.response?.data?.errors;
      if (errs) {
        const first = Object.entries(errs)[0];
        setError(`${first[0]}: ${first[1][0]}`);
      } else {
        setError(
          axiosErr.response?.data?.message ||
            axiosErr.response?.data?.error ||
            "Onboarding failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 text-white font-body"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(201,164,64,0.08) 0%, transparent 70%), #050D1A",
      }}
    >
      <div className="max-w-lg w-full space-y-4">
        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto border border-gold/20">
              <ClipboardList size={18} />
            </div>
            <h1 className="text-xl font-heading font-semibold">Business Setup</h1>
            <p className="text-xs text-zinc-400">
              Complete your vendor profile to start receiving bookings
            </p>
          </div>

          {/* Status note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><Check size={12} /> Profile under admin review after submission</p>
            <p className="text-blue-400/70">You&apos;ll be notified once approved. You can still access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-1.5">
              <ShieldAlert size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Vendor Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Tag size={10} className="text-gold" /> Service Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {VENDOR_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set("vendor_type", t.value)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      form.vendor_type === t.value
                        ? "bg-gold text-black border-gold"
                        : "bg-slate-800 text-zinc-300 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <User size={10} className="text-gold" /> Your Full Name *
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Business Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Building2 size={10} className="text-gold" /> Business Name *
              </label>
              <input
                type="text"
                required
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                placeholder="e.g. Royal Gardens & Banquets"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Email (optional) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Mail size={10} className="text-gold" /> Business Email (optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="contact@business.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileText size={10} className="text-gold" /> Description (optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Describe your services, specialties, capacity…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors resize-none"
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <MapPin size={10} className="text-gold" /> City *
                </label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  {MP_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  State
                </label>
                <select
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Full Address (optional)
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street, Landmark, Area"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* GSTIN */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                GSTIN / Registration Number (optional)
              </label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => set("gstin", e.target.value.toUpperCase().slice(0, 15))}
                placeholder="e.g. 23AAAAA1111A1Z1"
                maxLength={15}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50 font-mono tracking-wider transition-colors"
              />
              {form.gstin && form.gstin.length !== 15 && (
                <p className="text-[10px] text-amber-400">GSTIN must be exactly 15 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 btn-gold py-3 rounded-xl text-black font-bold disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
