"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { Check, ClipboardList } from "lucide-react";

export default function VendorOnboarding() {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const [serviceType, setServiceType] = useState("Venue");
  const [city, setCity] = useState("Bhopal");

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate setup auth credentials cookies
    document.cookie = "access_token=mock_jwt_token; path=/";
    document.cookie = "user_role=vendor; path=/";
    setToken("mock_jwt_token", "vendor");
    router.push("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-body">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
        
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto border border-gold/20">
            <ClipboardList size={18} />
          </div>
          <h1 className="text-xl font-heading font-semibold">Business Details</h1>
          <p className="text-xs text-zinc-400">Step 2 of 2: Configure your service profile</p>
        </div>

        <form onSubmit={handleFinish} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Service Category</label>
            <div className="grid grid-cols-3 gap-2">
              {["Venue", "Catering", "Decor"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setServiceType(cat)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${serviceType === cat ? "bg-gold text-black border-gold" : "bg-slate-800 text-zinc-300 border-slate-700"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Operating City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none bg-slate-800 cursor-pointer"
            >
              <option value="Bhopal">Bhopal</option>
              <option value="Indore">Indore</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">GSTIN / Registration Number</label>
            <input 
              type="text"
              required
              placeholder="e.g. 23AAAAA1111A1Z1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
            />
          </div>

          <button type="submit" className="w-full btn-gold justify-center py-2.5 rounded-lg text-black mt-2">
            Complete Registration & Enter Console <Check size={14} />
          </button>
        </form>

      </div>
    </div>
  );
}
