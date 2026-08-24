"use client";

import Link from "next/link";
import { Store, Camera, Music, Sparkles, Utensils, Flower, Calendar, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { ApprovalGate } from "@/components/vendor/ApprovalGate";

interface ServiceOption {
  code: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const serviceOptions: ServiceOption[] = [
  { code: "venue", name: "Wedding Venue", desc: "Banquet halls, gardens, resorts, farmhouses", icon: Store },
  { code: "caterer", name: "Catering", desc: "Pure vegetarian, multi-cuisine buffets, food stalls", icon: Utensils },
  { code: "decorator", name: "Decorator", desc: "Mandap setups, floral stage installations, thematic lighting", icon: Flower },
  { code: "photographer", name: "Photographer", desc: "Pre-wedding shoots, cinematic films, traditional photo", icon: Camera },
  { code: "dj", name: "DJ & Sound", desc: "Professional sound systems, lights, live entertainment", icon: Music },
  { code: "makeup", name: "Makeup Artist", desc: "Bridal makeup packages, guest cosmetics, hair styling", icon: Sparkles },
  { code: "planner", name: "Wedding Planner", desc: "Full wedding planning, day-of-event coordination", icon: Calendar },
];

export default function AddListingSelectPage() {
  return (
    <ApprovalGate>
    <div className="space-y-7 font-body max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/vendor/listings"
          aria-label="Back to your services"
          className="mt-0.5 w-9 h-9 shrink-0 rounded-xl border border-[#EAECF0] bg-white flex items-center justify-center text-[#667085] hover:text-[#101828] hover:shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <span className="eyebrow">Step 1 of 2</span>
          <h1 className="text-xl font-bold text-[#101828] mt-0.5">What do you offer?</h1>
          <p className="text-xs text-gray-400 mt-1">
            Pick a category to start. You can add more services later — one listing per service.
          </p>
        </div>
      </div>

      {/* Review notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
        <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Every new listing goes to our team for approval. It stays private until approved — you&apos;ll be
          notified as soon as it goes live.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {serviceOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.code}
              href={`/vendor/listings/add/form?type=${opt.code}`}
              className="group relative flex flex-col justify-between h-44 p-5 console-card console-card-lift overflow-hidden"
            >
              {/* Warm wash on hover */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative space-y-3">
                <span className="service-tile w-11 h-11 rounded-xl">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#101828] text-[15px] leading-tight">{opt.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-2">{opt.desc}</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between text-xs font-semibold text-gold pt-2">
                <span>Continue</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
    </ApprovalGate>
  );
}
