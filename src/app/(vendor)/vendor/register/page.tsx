"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { authApi } from "@/lib/authApi";
import Link from "next/link";
import { Store, ShieldAlert, Phone, KeyRound, ArrowRight, ChevronLeft, Zap } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

type Step = "phone" | "otp";

export default function VendorRegister() {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const setUser = useStore((s) => s.setUser);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Step 1: Send OTP (creates vendor user if new) ─────────────────────
  /** Normalize to E.164 format required by the backend PhoneNumberField */
  const toE164 = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = toE164(phone.trim());
    if (!cleaned || cleaned.length < 13) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ phone: cleaned, role: "vendor", intent: "register" });
      if (res.is_new_user === false) {
        setError("This number is already registered. Please sign in.");
        return;
      }
      setIsNewUser(res.is_new_user);
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setStep("otp");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; message?: string; error?: string } } };
      setError(
        axiosErr.response?.data?.detail ||
          axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = toE164(phone.trim());
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ phone: cleaned, otp_code: otp });
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      document.cookie = `access_token=${res.access}; path=/; max-age=86400`;
      document.cookie = `user_role=vendor; path=/; max-age=86400`;
      setToken(res.access, "vendor");
      setUser(res.user);

      // Always go to onboarding for registration flow
      router.push("/vendor/onboarding");
    } catch (err: unknown) {
      console.error("[verifyOtp error]", err);
      const axiosErr = err as { response?: { data?: { detail?: string; message?: string; error?: string } }; message?: string };
      const serverMsg = axiosErr.response?.data?.detail || axiosErr.response?.data?.message || axiosErr.response?.data?.error;
      setError(serverMsg || axiosErr.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="console-auth flex items-center justify-center p-6 font-body"
    >
      <div className="max-w-sm w-full space-y-4">

        {/* ── Dev OTP Hint ── */}
        {devOtp && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-1 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Zap size={13} className="text-amber-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Dev Mode — OTP Code
              </p>
            </div>
            <p className="text-2xl font-mono font-bold text-[#101828] tracking-[0.3em] text-center py-1">
              {devOtp}
            </p>
            {isNewUser && (
              <p className="text-[10px] text-emerald-600 text-center font-semibold">
                New number — your account is created once you verify this code
              </p>
            )}
          </div>
        )}

        {/* ── Card ── */}
        <div className="console-card rounded-2xl p-6 md:p-8 space-y-5">

          <div className="text-center space-y-2">
            <BrandMark size="lg" tone="dark" className="justify-center" />
            <h1 className="text-lg font-semibold text-[#101828] pt-1">Join as a Partner</h1>
            <p className="text-xs text-[#667085]">
              {step === "phone"
                ? "Register your venue, catering, or decor listing"
                : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-1 rounded-full transition-all ${step === "phone" || step === "otp" ? "bg-gold" : "bg-[#EAECF0]"}`} />
            <div className={`flex-1 h-1 rounded-full transition-all ${step === "otp" ? "bg-gold" : "bg-[#EAECF0]"}`} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs space-y-1.5">
              <p className="flex items-center gap-1.5">
                <ShieldAlert size={14} /> {error}
              </p>
              {error.toLowerCase().includes("already registered") && (
                <Link href="/vendor/login" className="text-gold hover:underline font-semibold inline-block pl-5">
                  Go to vendor sign in
                </Link>
              )}
            </div>
          )}

          {/* ── Phone Step ── */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                  Mobile Number
                </label>
                <div className="flex items-center bg-white border border-[#EAECF0] rounded-xl overflow-hidden focus-within:border-gold/60 focus-within:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] transition-all">
                  <span className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#98A2B3] border-r border-[#EAECF0] select-none">
                    <Phone size={12} /> +91
                  </span>
                  <input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    inputMode="numeric"
                    maxLength={10}
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-[#98A2B3]">If this number is already registered, please sign in instead.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 btn-gold py-2.5 rounded-lg text-black disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  <>
                    Get OTP <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── OTP Step ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                  Enter OTP
                </label>
                <div className="flex items-center bg-white border border-[#EAECF0] rounded-xl overflow-hidden focus-within:border-gold/60 focus-within:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] transition-all">
                  <span className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#98A2B3] border-r border-[#EAECF0] select-none">
                    <KeyRound size={12} />
                  </span>
                  <input
                    id="register-otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="_ _ _ _ _ _"
                    inputMode="numeric"
                    maxLength={6}
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none tracking-[0.4em] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 btn-gold py-2.5 rounded-lg text-black disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify & Continue <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setError(""); setDevOtp(null); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-[#667085] hover:text-[#101828] transition-colors"
              >
                <ChevronLeft size={13} /> Change phone number
              </button>
            </form>
          )}

          <p className="text-[11px] text-[#667085] text-center">
            Already registered?{" "}
            <Link href="/vendor/login" className="text-gold hover:underline font-semibold">
              Please sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
