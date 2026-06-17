"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import Link from "next/link";
import { Store, ShieldAlert, Zap, Copy, Check } from "lucide-react";

const DEMO_EMAIL = "vendor@royalgardens.in";
const DEMO_PASSWORD = "demo1234";

export default function VendorLogin() {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"email" | "pass" | null>(null);
  const [loading, setLoading] = useState(false);

  // Core login function — receives final email/password values directly
  const performLogin = (em: string, pw: string) => {
    if (!em || !pw) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    // Set cookie (for SSR middleware) and Zustand store (for client state)
    document.cookie = "access_token=mock_jwt_token; path=/; max-age=86400";
    document.cookie = "user_role=vendor; path=/; max-age=86400";
    setToken("mock_jwt_token", "vendor");

    // Small delay to show loading spinner, then navigate
    setTimeout(() => {
      router.push("/vendor/profile");
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    performLogin(DEMO_EMAIL, DEMO_PASSWORD);
  };

  const copyToClipboard = (type: "email" | "pass") => {
    navigator.clipboard.writeText(type === "email" ? DEMO_EMAIL : DEMO_PASSWORD);
    setCopied(type);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 text-white font-body"
      style={{
        background:
          "radial-gradient(ellipse at 60% 0%, rgba(201,164,64,0.07) 0%, transparent 60%), #050D1A",
      }}
    >
      <div className="max-w-sm w-full space-y-4">

        {/* ── Demo Credentials Card ── */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gold" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold">
              Demo Vendor Account
            </p>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2">
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Email</p>
              <p className="text-xs text-white font-mono mt-0.5">{DEMO_EMAIL}</p>
            </div>
            <button
              onClick={() => copyToClipboard("email")}
              className="text-slate-500 hover:text-gold transition-colors ml-3 shrink-0"
            >
              {copied === "email" ? <Check size={13} className="text-gold" /> : <Copy size={13} />}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2">
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Password</p>
              <p className="text-xs text-white font-mono mt-0.5">{DEMO_PASSWORD}</p>
            </div>
            <button
              onClick={() => copyToClipboard("pass")}
              className="text-slate-500 hover:text-gold transition-colors ml-3 shrink-0"
            >
              {copied === "pass" ? <Check size={13} className="text-gold" /> : <Copy size={13} />}
            </button>
          </div>

          {/* One-click demo login */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #C9A440, #D4B96A)", color: "#050D1A" }}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Logging in…
              </>
            ) : (
              <>
                <Zap size={14} /> One-Click Demo Login → Profile Page
              </>
            )}
          </button>
        </div>

        {/* ── Login Form Card ── */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl backdrop-blur-md">

          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto border border-gold/20">
              <Store size={18} />
            </div>
            <h1 className="text-xl font-heading font-semibold">Vendor Console</h1>
            <p className="text-xs text-zinc-400">Sign in to manage listings &amp; bookings</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-1.5">
              <ShieldAlert size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold justify-center py-2.5 rounded-lg text-black disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Login as Partner"
              )}
            </button>
          </form>

          <p className="text-[11px] text-zinc-400 text-center">
            New vendor?{" "}
            <Link href="/vendor/register" className="text-gold hover:underline font-semibold">
              Register Business
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
