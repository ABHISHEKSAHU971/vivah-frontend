"use client";

import { useStore } from "@/store/store";

export default function CustomerProfile() {
  const onboarding = useStore((s) => s.onboarding);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">My Profile Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Manage your verified number and wedding preferences</p>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Verified Mobile</label>
          <input 
            type="text" 
            disabled 
            value={onboarding.phone || "+91 98765 43210"} 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Preferred Wedding Location</label>
          <input 
            type="text" 
            disabled 
            value={onboarding.location || "Bhopal, MP"} 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Wedding Budget</label>
          <input 
            type="text" 
            disabled 
            value={`₹${(onboarding.budget || 500000).toLocaleString("en-IN")}`} 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Expected Guest Count</label>
          <input 
            type="text" 
            disabled 
            value={`${onboarding.guests || 150} Guests`} 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
