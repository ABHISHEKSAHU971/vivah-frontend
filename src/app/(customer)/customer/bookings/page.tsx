"use client";

import { useStore } from "@/store/store";
import { CheckCircle2, RefreshCw } from "lucide-react";

export default function CustomerBookings() {
  const onboarding = useStore((s) => s.onboarding);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Celebration Bookings</h1>
        <p className="text-xs text-gray-400 mt-1">Check status for individual venues and services</p>
      </div>

      <hr className="border-gray-100" />

      {/* Simulated Booking list */}
      <div className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">Venue Slot</span>
            <span className="text-[10px] text-gray-400">Order ID: PMV-2026-089</span>
          </div>
          <h3 className="font-heading font-semibold text-gray-800 text-base">Royal Gardens Bhopal</h3>
          <p className="text-xs text-gray-500">Scheduled for Bhopal location • Up to {onboarding.guests || 800} guests</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10 shrink-0">
          <RefreshCw size={13} className="animate-spin" /> Verifying availability
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Modular Service</span>
            <span className="text-[10px] text-gray-400">Order ID: PMV-2026-042</span>
          </div>
          <h3 className="font-heading font-semibold text-gray-800 text-base">Annapurna Catering Package</h3>
          <p className="text-xs text-gray-500">Tilak & Sangeet Meals • Veg & Jain Menu</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10 shrink-0">
          <CheckCircle2 size={13} /> Confirmed
        </div>
      </div>
    </div>
  );
}
