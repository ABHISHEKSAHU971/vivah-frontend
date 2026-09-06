"use client";

import Link from "next/link";
import { Building2, Camera, Music, Palette, Sparkles, Utensils } from "lucide-react";

const CATEGORIES = [
  { key: "venues", label: "Venues", href: "/venues", icon: Building2 },
  { key: "catering", label: "Catering", href: "/services/catering", icon: Utensils },
  { key: "decorations", label: "Decoration", href: "/services/decorations", icon: Palette },
  { key: "dj-sound", label: "DJ & Sound", href: "/services/dj-sound", icon: Music },
  { key: "photography", label: "Photography", href: "/services/photography", icon: Camera },
  { key: "makeup", label: "Makeup", href: "/services/makeup", icon: Sparkles },
] as const;

export type ServiceCategoryKey = (typeof CATEGORIES)[number]["key"];

/**
 * The horizontal category rail that sits above every listing page, so a couple
 * can jump between venue and vendor catalogues without going back home.
 */
export default function ServiceCategoryStrip({ active }: { active: ServiceCategoryKey }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-2.5">
          {CATEGORIES.map(({ key, label, href, icon: Icon }) => {
            const isActive = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 flex flex-col items-center gap-1 px-5 sm:px-7 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#f5f3ef] text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={19} className={isActive ? "text-gold" : "text-gray-400"} />
                <span className={`text-[11px] whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
