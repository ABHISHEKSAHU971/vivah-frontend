"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Users, X } from "lucide-react";
import { CITIES_BY_STATE } from "@/lib/indiaLocations";
import { todayISO } from "@/lib/discovery";

const CITIES = Array.from(new Set(Object.values(CITIES_BY_STATE).flat())).sort();

export interface ServiceBrief {
  city: string;
  date: string;
  guests: string;
}

/** Read the brief the discovery gate put in the URL. */
export function useServiceBrief(): ServiceBrief {
  const params = useSearchParams();
  return {
    city: params.get("city") || "",
    date: params.get("date") || "",
    guests: params.get("guests") || "",
  };
}

/** Case-insensitive city match, tolerant of a missing city on either side. */
export function matchesCity(vendorCity: string | undefined, filterCity: string): boolean {
  if (!filterCity) return true;
  if (!vendorCity) return false;
  return vendorCity.trim().toLowerCase() === filterCity.trim().toLowerCase();
}

/**
 * The strip that shows (and lets you change) the city / date / guest-count
 * brief a customer gave the discovery gate, so those choices are visible on the
 * listing rather than silently dropped.
 */
export default function ServiceBriefBar({
  basePath,
  resultCount,
  noun,
}: {
  basePath: string;
  resultCount: number;
  noun: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const brief = useServiceBrief();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(next.toString() ? `${basePath}?${next}` : basePath);
  };

  const hasBrief = !!(brief.city || brief.date || brief.guests);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs">
          <MapPin size={13} className="text-gold" />
          <select
            value={brief.city}
            onChange={(e) => update("city", e.target.value)}
            aria-label="City"
            className="bg-transparent border-0 outline-none font-semibold text-gray-800 cursor-pointer"
          >
            <option value="">All cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <span className="w-px h-4 bg-gray-200" />

        <label className="flex items-center gap-1.5 text-xs">
          <CalendarDays size={13} className="text-gold" />
          <input
            type="date"
            min={todayISO()}
            value={brief.date}
            onChange={(e) => update("date", e.target.value)}
            aria-label="Event date"
            className="bg-transparent border-0 outline-none font-semibold text-gray-800 cursor-pointer [color-scheme:light]"
          />
        </label>

        {brief.guests && (
          <>
            <span className="w-px h-4 bg-gray-200" />
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <Users size={13} className="text-gold" /> {brief.guests} guests
              <button
                onClick={() => update("guests", "")}
                aria-label="Clear guest count"
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={11} />
              </button>
            </span>
          </>
        )}

        <span className="ml-auto text-xs text-gray-500">
          <strong className="text-gray-900">{resultCount}</strong> {noun}
          {resultCount !== 1 ? "s" : ""}
          {brief.city ? ` in ${brief.city}` : ""}
        </span>

        {hasBrief && (
          <button
            onClick={() => router.push(basePath)}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
