"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";

export default function VendorVenues() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Manage Garden & Banquet Listings</h1>
          <p className="text-xs text-gray-400 mt-1">Configure pricing packages and availability schedules</p>
        </div>
        <button className="btn-gold text-xs rounded-lg flex items-center gap-1 sm:self-center shrink-0">
          <Plus size={14} /> Add New Listing
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Grid of registered listings for this vendor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-zinc-50/20">
          <div className="relative h-44 w-full bg-gray-100">
            <Image
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80"
              alt="Royal Gardens Bhopal"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-semibold text-gray-950 text-base">Royal Gardens Bhopal</h3>
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-100">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-500">Lalghati, Bhopal • Max Capacity: 800 Guests</p>
            <div className="flex justify-between text-xs pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">₹85,000 /day</span>
              <span className="text-amber-500 font-semibold cursor-pointer hover:underline text-[11px]">Edit Slots & Calendar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
