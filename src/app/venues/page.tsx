"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, Star, Users, Loader2, AlertCircle, IndianRupee, Calendar, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

const VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
  "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
  "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80",
];

const CITIES = ["Bhopal", "Indore", "Jaipur", "Delhi", "Mumbai", "Hyderabad", "Ahmedabad", "Lucknow", "Chandigarh", "Pune"];
const GUEST_CAPACITIES = ["100-300 guests", "300-600 guests", "600-1000 guests", "1000+ guests"];

const PRICE_RANGES = [
  { label: "Any Price",       min: "",       max: "" },
  { label: "Under ₹75,000",  min: "",       max: "75000" },
  { label: "₹75K – ₹1.5L",  min: "75000",  max: "150000" },
  { label: "₹1.5L – ₹3L",   min: "150000", max: "300000" },
  { label: "Above ₹3L",      min: "300000", max: "" },
];

interface Venue {
  id: number;
  name: string;
  venue_type: string;
  city: string;
  state: string;
  price_per_day: string;
  avg_rating: string;
  total_bookings: number;
  min_capacity: number;
  max_capacity: number;
  images?: { image: string }[];
}

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial values from URL
  const [city, setCity]         = useState(searchParams.get("city") || "");
  const [guests, setGuests]     = useState(searchParams.get("guests") || "");
  const [search, setSearch]     = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
  const [eventDate, setEventDate]   = useState(searchParams.get("date") || "");

  const [venues, setVenues]   = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Parse selected price range into min/max values
  const getPriceParams = (rangeLabel: string) => {
    const range = PRICE_RANGES.find((r) => r.label === rangeLabel);
    return { min_price: range?.min || "", max_price: range?.max || "" };
  };

  const fetchVenues = useCallback(async (
    c: string, g: string, s: string, price: string, date: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (c)  params.city    = c;
      if (g)  params.guests  = g;
      if (s)  params.search  = s;

      const { min_price, max_price } = getPriceParams(price);
      if (min_price) params.min_price = min_price;
      if (max_price) params.max_price = max_price;

      // Use date for ordering — most relevant venues for a given event date
      if (date) params.ordering = "avg_rating";

      // ✅ Correct endpoint: /venues/venues/
      const { data } = await api.get("/venues/venues/", { params });
      const results: Venue[] = data?.data?.results ?? data?.data ?? data?.results ?? [];
      setVenues(results);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to load venues. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever URL params change
  useEffect(() => {
    const c     = searchParams.get("city")   || "";
    const g     = searchParams.get("guests") || "";
    const s     = searchParams.get("search") || "";
    const price = searchParams.get("price")  || "";
    const date  = searchParams.get("date")   || "";
    setCity(c);
    setGuests(g);
    setSearch(s);
    setPriceRange(price);
    setEventDate(date);
    fetchVenues(c, g, s, price, date);
  }, [searchParams, fetchVenues]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (city)       params.set("city",   city);
    if (guests)     params.set("guests", guests);
    if (search)     params.set("search", search);
    if (priceRange) params.set("price",  priceRange);
    if (eventDate)  params.set("date",   eventDate);
    router.push(`/venues?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setCity(""); setGuests(""); setSearch(""); setPriceRange(""); setEventDate("");
    router.push("/venues");
  };

  const hasActiveFilters = !!(city || guests || search || priceRange || eventDate);

  const getVenueImage = (venue: Venue, idx: number) => {
    return venue.images?.[0]?.image || VENUE_IMAGES[idx % VENUE_IMAGES.length];
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-heading font-semibold text-gray-900">Discover Celebration Venues</h1>
            <p className="text-sm text-gray-500">
              Find the perfect backdrop for your wedding ceremonies
              {city && <> in <span className="font-semibold text-gray-700">{city}</span></>}
              {guests && <> · <span className="font-semibold text-gray-700">{guests}</span></>}
              {priceRange && priceRange !== "Any Price" && <> · <span className="font-semibold text-amber-600">{priceRange}</span></>}
              {eventDate && <> · <span className="font-semibold text-gray-700">{eventDate}</span></>}
            </p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="flex flex-wrap gap-3 items-center justify-between">

              {/* Row 1 filters */}
              <div className="flex flex-wrap items-center gap-3 flex-1">

                {/* Search */}
                <div className="relative min-w-[180px] flex-1 md:flex-initial md:w-56">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search venues..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
                  />
                </div>

                {/* City */}
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white appearance-none cursor-pointer"
                    aria-label="Filter by city"
                  >
                    <option value="">All Cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Capacity */}
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white appearance-none cursor-pointer"
                    aria-label="Filter by guest capacity"
                  >
                    <option value="">Any Capacity</option>
                    {GUEST_CAPACITIES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white appearance-none cursor-pointer"
                    aria-label="Filter by price range"
                  >
                    {PRICE_RANGES.map((r) => (
                      <option key={r.label} value={r.label}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Event Date */}
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white [color-scheme:light] cursor-pointer"
                    aria-label="Filter by event date"
                    title="Event Date"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 px-3 py-2.5 border border-gray-200 rounded-lg transition-colors"
                    title="Clear all filters"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
                <button
                  onClick={handleApplyFilters}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          {!loading && !error && (
            <p className="text-xs text-gray-500 mb-4">
              {venues.length === 0
                ? "No venues found matching your criteria."
                : `Showing ${venues.length} venue${venues.length !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 size={36} className="animate-spin mb-3" />
              <p className="text-sm">Finding venues for you…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle size={36} className="mb-3" />
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => fetchVenues(city, guests, search, priceRange, eventDate)}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && venues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <MapPin size={40} className="mb-3 text-gray-300" />
              <p className="text-base font-semibold text-gray-600 mb-1">No venues found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your city, guest count, or price filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Listings Grid */}
          {!loading && !error && venues.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {venues.map((venue, idx) => (
                <Link key={venue.id} href={`/venues/${venue.id}`}>
                  <div className="venue-card group cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all shadow-gold-hover">
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={getVenueImage(venue, idx)}
                        alt={venue.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded">
                        {venue.venue_type}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-heading font-semibold text-lg text-gray-900 truncate">{venue.name}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={14} className="fill-amber-400 stroke-amber-400" />
                          <span className="text-xs font-semibold text-gray-800">
                            {Number(venue.avg_rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin size={12} className="text-gray-400" />
                        {venue.city}, {venue.state}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div>
                          <span className="text-sm font-bold text-gray-900">
                            ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-gray-500"> /day</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <Users size={12} className="text-gray-400" />
                          {venue.min_capacity}–{venue.max_capacity} guests
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
