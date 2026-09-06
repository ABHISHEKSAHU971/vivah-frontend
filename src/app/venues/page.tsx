"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCategoryStrip from "@/components/ServiceCategoryStrip";
import VenueCard, { VENUE_TYPE_LABELS, type VenueSummary } from "@/components/VenueCard";
import VenueFilterBar, { PRICE_RANGES, type VenueFilters } from "@/components/VenueFilterBar";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowUpDown, Building2, CalendarDays, ChevronRight, Loader2,
  MapPin, Search, SlidersHorizontal, Users, X,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "popular", label: "Most booked" },
  { value: "-avg_rating", label: "Top rated" },
  { value: "price_per_day", label: "Price: low to high" },
  { value: "-price_per_day", label: "Price: high to low" },
  { value: "-created_at", label: "Newest first" },
];

const FILTER_KEYS = ["city", "venue_type", "locality", "date", "guests", "price", "search"] as const;

/** Translate the page's query string into the params the venue API expects. */
function toApiParams(query: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(query).entries()) {
    if (!value) continue;
    if (key === "price") {
      // A label like "₹75K – ₹1.5L" becomes the numeric bounds the API wants.
      const range = PRICE_RANGES.find((r) => r.label === value);
      if (range?.min) params.min_price = range.min;
      if (range?.max) params.max_price = range.max;
    } else {
      params[key] = value;
    }
  }
  if (!params.ordering) params.ordering = "popular";
  return params;
}

function readFilters(qs: URLSearchParams): VenueFilters {
  return {
    city: qs.get("city") || "",
    venue_type: qs.get("venue_type") || "",
    locality: qs.get("locality") || "",
    date: qs.get("date") || "",
    guests: qs.get("guests") || "",
    price: qs.get("price") || "",
    search: qs.get("search") || "",
  };
}

function VenuesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchParamsStr = searchParams.toString();

  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived straight from the URL — the URL is the source of truth for
  // filters, so there is nothing to sync into state.
  const filters = readFilters(searchParams);
  const ordering = searchParams.get("ordering") || "popular";

  const fetchVenues = useCallback((query: string) => {
    let cancelled = false;
    api
      .get("/venues/venues/", { params: toApiParams(query) })
      .then(({ data }) => {
        if (cancelled) return;
        const results = data?.results ?? data?.data?.results ?? data?.data ?? [];
        setVenues(results);
        setTotal(data?.count ?? data?.data?.count ?? results.length);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || "Failed to load venues. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => fetchVenues(searchParamsStr), [searchParamsStr, fetchVenues]);

  /** Navigate to a new query string. The effect above does the refetching. */
  const navigate = (params: URLSearchParams) => {
    setLoading(true);
    router.push(params.toString() ? `/venues?${params}` : "/venues");
  };

  const applyFilters = (next: VenueFilters, nextOrdering = ordering) => {
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = next[key];
      if (value && !(key === "price" && value === "Any Price")) params.set(key, value);
    }
    if (nextOrdering && nextOrdering !== "popular") params.set("ordering", nextOrdering);
    navigate(params);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParamsStr);
    params.delete(key);
    navigate(params);
  };

  const activePills = [
    filters.city && { key: "city", label: filters.city, icon: MapPin },
    filters.venue_type && {
      key: "venue_type",
      label: VENUE_TYPE_LABELS[filters.venue_type] || filters.venue_type,
      icon: Building2,
    },
    filters.locality && { key: "locality", label: filters.locality, icon: MapPin },
    filters.date && {
      key: "date",
      label: new Date(filters.date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }),
      icon: CalendarDays,
    },
    filters.guests && { key: "guests", label: filters.guests, icon: Users },
    filters.price && filters.price !== "Any Price" && {
      key: "price", label: filters.price, icon: SlidersHorizontal,
    },
    filters.search && { key: "search", label: `“${filters.search}”`, icon: Search },
  ].filter(Boolean) as { key: string; label: string; icon: typeof MapPin }[];

  return (
    <>
      <Navbar />

      <div className="pt-16 bg-white">
        <ServiceCategoryStrip active="venues" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* A new URL remounts the bar with fresh defaults. */}
          <VenueFilterBar
            key={searchParamsStr}
            initial={filters}
            onSubmit={(next) => applyFilters(next)}
          />
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      <main className="bg-[#f5f3ef] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-gray-900 font-semibold">Venues</span>
          </nav>
          <p className="text-sm text-gray-600 mb-5 max-w-4xl">
            Explore a wide selection of top-tier wedding venues, from luxurious city hotels and
            elegant banquet halls to charming lawns and stunning destination spots.
          </p>

          {activePills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {activePills.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => removeFilter(key)}
                  className="group flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
                >
                  <Icon size={10} className="text-gold" /> {label}
                  <X size={11} className="text-gray-400 group-hover:text-gray-700" />
                </button>
              ))}
              <button
                onClick={() => navigate(new URLSearchParams())}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-xs text-gray-500">
                <strong className="text-gray-900">{total}</strong> venue{total !== 1 ? "s" : ""}
                {filters.date ? " available on your date" : ""}
              </p>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <ArrowUpDown size={12} className="text-gray-400" />
                <span className="font-semibold">Sort</span>
                <select
                  value={ordering}
                  onChange={(e) => applyFilters(filters, e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 cursor-pointer focus:outline-none focus:border-gold"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle size={36} className="mb-3" />
              <p className="text-sm font-medium mb-4">{error}</p>
              <button
                onClick={() => fetchVenues(searchParamsStr)}
                className="px-4 py-2 text-xs font-bold bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && venues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MapPin size={40} className="mb-3 text-gray-300" />
              <p className="text-base font-semibold text-gray-700 mb-1">No venues match these filters</p>
              <p className="text-sm text-gray-400 mb-4 max-w-sm">
                {filters.date
                  ? "Every venue here is booked or blocked on that date. Try a nearby date, or widen the city and capacity."
                  : "Try widening the city, capacity, or budget."}
              </p>
              {activePills.length > 0 && (
                <button
                  onClick={() => navigate(new URLSearchParams())}
                  className="px-4 py-2 text-xs font-bold text-gold border border-gold/40 rounded-xl hover:bg-gold/5 transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && venues.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {venues.map((venue, idx) => (
                <VenueCard key={venue.id} venue={venue} index={idx} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function VenuesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ef]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    }>
      <VenuesPageContent />
    </Suspense>
  );
}
