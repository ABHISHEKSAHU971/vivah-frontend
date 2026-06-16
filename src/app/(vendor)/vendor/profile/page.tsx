"use client";

import { useStore } from "@/store/store";

export default function VendorProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Partner Business Profile</h1>
        <p className="text-xs text-gray-400 mt-1">Configure company profile details and verified settings</p>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Business Name</label>
          <input 
            type="text" 
            disabled 
            value="Royal Gardens & Banquets" 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Registration Code (GSTIN)</label>
          <input 
            type="text" 
            disabled 
            value="23AAAAA1111A1Z1" 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Primary City</label>
          <input 
            type="text" 
            disabled 
            value="Bhopal" 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Support Contact Phone</label>
          <input 
            type="text" 
            disabled 
            value="+91 98765 99999" 
            className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
