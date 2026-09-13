"use client";

import type { LucideIcon } from "lucide-react";

export interface HighlightItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface Props {
  title?: string;
  items: HighlightItem[];
  className?: string;
}

/**
 * Gold-themed highlight grid used on venue / decoration / service detail pages.
 */
export default function ListingHighlights({
  title = "Highlights",
  items,
  className = "",
}: Props) {
  if (!items.length) return null;

  return (
    <section className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-1 h-4 rounded-full bg-gold" />
        <h2 className="font-heading font-semibold text-base text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent px-3 py-3 min-h-[76px] flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-gold/15 border border-gold/25 text-gold flex items-center justify-center shrink-0">
                <Icon size={12} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 leading-tight">
                {label}
              </p>
            </div>
            <p className="text-[12px] font-semibold text-gray-900 leading-snug pl-0.5">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
