"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";

export default function VendorRegister() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to onboarding stepper to input business services details
    router.push("/vendor/onboarding");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-body">
      <div className="max-w-sm w-full bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
        
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto border border-gold/20">
            <Store size={18} />
          </div>
          <h1 className="text-xl font-heading font-semibold">Join as a Partner</h1>
          <p className="text-xs text-zinc-400">Register your catering, decor, or garden listing</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Business Name</label>
            <input 
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Royal Caterers"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Contact Email</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@business.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
            />
          </div>

          <button type="submit" className="w-full btn-gold justify-center py-2.5 rounded-lg text-black mt-2">
            Proceed to Onboarding
          </button>
        </form>

        <p className="text-[11px] text-zinc-400 text-center">
          Already registered?{" "}
          <Link href="/vendor/login" className="text-gold hover:underline font-semibold">
            Sign In Here
          </Link>
        </p>

      </div>
    </div>
  );
}
