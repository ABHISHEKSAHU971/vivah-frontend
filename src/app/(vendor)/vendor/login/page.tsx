"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import Link from "next/link";
import { Store, ShieldAlert } from "lucide-react";

export default function VendorLogin() {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Simulate JWT token response set cookie & store
      document.cookie = "access_token=mock_jwt_token; path=/";
      document.cookie = "user_role=vendor; path=/";
      setToken("mock_jwt_token", "vendor");
      router.push("/vendor/dashboard");
    } else {
      setError("Please check your email and password credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-body">
      <div className="max-w-sm w-full bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
        
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto border border-gold/20">
            <Store size={18} />
          </div>
          <h1 className="text-xl font-heading font-semibold">Vendor Console</h1>
          <p className="text-xs text-zinc-400">Sign in to manage listings & bookings</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-1.5">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@business.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
            />
          </div>

          <button type="submit" className="w-full btn-gold justify-center py-2.5 rounded-lg text-black mt-2">
            Login as Partner
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
  );
}
