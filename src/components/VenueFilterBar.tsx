"use client";

import { useState } from "react";
import { Building2, CalendarDays, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { VENUE_TYPE_LABELS } from "@/components/VenueCard";
import { CITIES_BY_STATE } from "@/lib/indiaLocations";
import { todayISO } from "@/lib/discovery";

const CITIES = Array.from(new Set(Object.values(CITIES_BY_STATE).flat())).sort();

export const GUEST_CAPACITIES = ["100-300 guests", "300-600 guests", "600-1000 guests", "1000+ guests"];

export const PRICE_RANGES = [
  { label: "Any Price", min: "", max: "" },
  { label: "Under ₹75,000", min: "", max: "75000" },
  { label: "₹75K – ₹1.5L", min: "75000", max: "150000" },
  { label: "₹1.5L – ₹3L", min: "150000", max: "300000" },
  { label: "Above ₹3L", min: "300000", max: "" },
];

export interface VenueFilters {
  city: string;
  venue_type: string;
  locality: string;
  date: string;
  guests: string;
  price: string;
  search: string;
}

const CELL_CONTROL =
  "w-full bg-transparent border-0 outline-none text-[13px] text-gray-700 cursor-pointer appearance-none truncate";

/** One cell of the search bar. */
function FilterCell({
  label, icon: Icon, children,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-800 mb-0.5">
        <Icon size={11} className="text-gold" /> {label}
      </span>
      {children}
    </div>
  );
}

/**
 * The venue search bar. Owns its own draft state and only tells the page about
 * it on submit, so typing a locality doesn't refetch on every keystroke.
 *
 * Mount this with `key={searchParamsStr}` — a new URL remounts it with fresh
 * defaults rather than syncing props into state.
 */
export default function VenueFilterBar({
  initial,
  onSubmit,
}: {
  initial: VenueFilters;
  onSubmit: (filters: VenueFilters) => void;
}) {
  const [filters, setFilters] = useState<VenueFilters>(initial);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof VenueFilters>(key: K, value: VenueFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const submit = (overrides: Partial<VenueFilters> = {}) => {
    onSubmit({ ...filters, ...overrides });
    setShowAdvanced(false);
  };

  const advancedSummary =
    [filters.guests, filters.price !== "Any Price" ? filters.price : ""].filter(Boolean).join(" · ");

  return (
    <>
      <div className="rounded-2xl bg-white border border-gray-200 shadow-[0_4px_20px_-6px_rgba(16,24,40,0.12)] flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-gray-100 overflow-hidden">

        <FilterCell label="Looking For" icon={Building2}>
          <select
            value={filters.venue_type}
            onChange={(e) => set("venue_type", e.target.value)}
            className={CELL_CONTROL}
            aria-label="Venue type"
          >
            <option value="">Any venue type</option>
            {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FilterCell>

        <FilterCell label="Where" icon={MapPin}>
          <select
            value={filters.city}
            onChange={(e) => set("city", e.target.value)}
            className={CELL_CONTROL}
            aria-label="City"
          >
            <option value="">All cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FilterCell>

        <FilterCell label="Locality" icon={MapPin}>
          <input
            type="text"
            value={filters.locality}
            placeholder="Area or pincode"
            onChange={(e) => set("locality", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`${CELL_CONTROL} cursor-text placeholder:text-gray-400`}
            aria-label="Locality"
          />
        </FilterCell>

        <FilterCell label="Availability" icon={CalendarDays}>
          <input
            type="date"
            min={todayISO()}
            value={filters.date}
            onChange={(e) => set("date", e.target.value)}
            className={`${CELL_CONTROL} [color-scheme:light]`}
            aria-label="Event date"
          />
        </FilterCell>

        <FilterCell label="Filter" icon={SlidersHorizontal}>
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            aria-expanded={showAdvanced}
            className={`${CELL_CONTROL} text-left ${advancedSummary ? "text-gray-900 font-semibold" : "text-gray-400"}`}
          >
            {advancedSummary || "Budget, capacity"}
          </button>
        </FilterCell>

        <div className="p-2 flex items-center shrink-0">
          <button
            onClick={() => submit()}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#050D1A] hover:bg-black text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Search <Search size={15} />
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Guest capacity</label>
            <select
              value={filters.guests}
              onChange={(e) => set("guests", e.target.value)}
              className="block px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white cursor-pointer focus:outline-none focus:border-gold"
            >
              <option value="">Any capacity</option>
              {GUEST_CAPACITIES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Budget per day</label>
            <select
              value={filters.price}
              onChange={(e) => set("price", e.target.value)}
              className="block px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white cursor-pointer focus:outline-none focus:border-gold"
            >
              {PRICE_RANGES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
            </select>
          </div>
          <div className="space-y-1 flex-grow min-w-[180px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Venue name</label>
            <input
              type="text"
              value={filters.search}
              placeholder="Search by name…"
              onChange={(e) => set("search", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gold"
            />
          </div>
          <button
            onClick={() => submit()}
            className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-black text-xs font-bold transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </>
  );
}
