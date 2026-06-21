"use client";

import Link from "next/link";
import { Store, Camera, Music, Sparkles, Utensils, Flower, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

interface ServiceOption {
  code: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const serviceOptions: ServiceOption[] = [
  { code: "venue", name: "Wedding Venue", desc: "Banquet halls, gardens, resorts, farmhouses", icon: Store },
  { code: "dj", name: "DJ & Sound", desc: "Professional sound systems, lights, live entertainment", icon: Music },
  { code: "photographer", name: "Photographer", desc: "Pre-wedding shoots, cinematic films, traditional photo", icon: Camera },
  { code: "makeup", name: "Makeup Artist", desc: "Bridal makeup packages, guest cosmetics, hair styling", icon: Sparkles },
  { code: "caterer", name: "Catering", desc: "Pure vegetarian, multi-cuisine buffets, food stalls", icon: Utensils },
  { code: "decorator", name: "Decorator", desc: "Mandap setups, floral stage installations, thematic lighting", icon: Flower },
  { code: "planner", name: "Wedding Planner", desc: "Full wedding planning, day-of-event coordination", icon: Calendar },
];

export default function AddListingSelectPage() {
  return (
    <div className="space-y-6 font-body max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/vendor/listings" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Add New Listing</h1>
          <p className="text-xs text-gray-400 mt-1">Select the type of wedding service you want to register</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
        {serviceOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link 
              key={opt.code} 
              href={`/vendor/listings/add/form?type=${opt.code}`}
              className="border border-gray-150 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-gold/30 hover:-translate-y-0.5 transition-all group flex flex-col justify-between h-48"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/15 group-hover:bg-gold group-hover:text-black transition-all">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-gray-950 text-base">{opt.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-normal line-clamp-2">{opt.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-gold group-hover:text-amber-600 transition-colors pt-2">
                <span>Configure Form</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
