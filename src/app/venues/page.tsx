"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, MapPin, SlidersHorizontal, Star, Users, Loader2,
  AlertCircle, IndianRupee, Calendar, X, Building2, Check
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

const VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
  "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
  "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
];

const CITIES = ["Bhopal", "Indore", "Jaipur", "Delhi", "Mumbai", "Hyderabad", "Ahmedabad", "Lucknow", "Chandigarh", "Pune"];
const GUEST_CAPACITIES = ["100-300 guests", "300-600 guests", "600-1000 guests", "1000+ guests"];
const PRICE_RANGES = [
  { label: "Any Price",      min: "",       max: "" },
  { label: "Under ₹75,000", min: "",       max: "75000" },
  { label: "₹75K – ₹1.5L", min: "75000",  max: "150000" },
  { label: "₹1.5L – ₹3L",  min: "150000", max: "300000" },
  { label: "Above ₹3L",     min: "300000", max: "" },
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

function VenuesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [city, setCity]             = useState(searchParams.get("city") || "");
  const [guests, setGuests]         = useState(searchParams.get("guests") || "");
  const [search, setSearch]         = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
  const [eventDate, setEventDate]   = useState(searchParams.get("date") || "");
  const [showFilters, setShowFilters] = useState(false);

  const [venues, setVenues]   = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const getPriceParams = (rangeLabel: string) => {
    const range = PRICE_RANGES.find((r) => r.label === rangeLabel);
    return { min_price: range?.min || "", max_price: range?.max || "" };
  };

  const fetchVenues = useCallback(async (c: string, g: string, s: string, price: string, date: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (c) params.city   = c;
      if (g) params.guests = g;
      if (s) params.search = s;
      const { min_price, max_price } = getPriceParams(price);
      if (min_price) params.min_price = min_price;
      if (max_price) params.max_price = max_price;
      if (date) params.ordering = "avg_rating";
      const { data } = await api.get("/venues/venues/", { params });
      setVenues(data?.data?.results ?? data?.data ?? data?.results ?? []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to load venues. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchParamsStr = searchParams.toString();

  useEffect(() => {
    const c = searchParams.get("city") || "";
    const g = searchParams.get("guests") || "";
    const s = searchParams.get("search") || "";
    const price = searchParams.get("price") || "";
    const date  = searchParams.get("date") || "";
    setCity(c); setGuests(g); setSearch(s); setPriceRange(price); setEventDate(date);
    fetchVenues(c, g, s, price, date);
  }, [searchParamsStr, fetchVenues]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (city)       params.set("city",   city);
    if (guests)     params.set("guests", guests);
    if (search)     params.set("search", search);
    if (priceRange) params.set("price",  priceRange);
    if (eventDate)  params.set("date",   eventDate);
    router.push(`/venues?${params.toString()}`);
    setShowFilters(false);
    fetchVenues(city, guests, search, priceRange, eventDate);
  };

  const handleClearFilters = () => {
    setCity(""); setGuests(""); setSearch(""); setPriceRange(""); setEventDate("");
    router.push("/venues");
    setShowFilters(false);
    fetchVenues("", "", "", "", "");
  };

  const hasActiveFilters = !!(city || guests || search || priceRange || eventDate);
  const getVenueImage = (venue: Venue, idx: number) =>
    venue.images?.[0]?.image || VENUE_IMAGES[idx % VENUE_IMAGES.length];

  return (
    <>
      <Navbar />

      {/* ── Dark Hero ───────────────────────────────────────────── */}
      <section className="relative pt-16 pb-0 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-1.5 rounded-full text-[11px] font-semibold text-gold uppercase tracking-wider mb-5">
            <Building2 size={12} /> Wedding Venues & Banquets
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-white mb-4 leading-tight">
            Discover Perfect<br />
            <span className="text-gold italic">Celebration Venues</span>
          </h1>
          <p className="text-sm text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
            Find the perfect backdrop for every wedding ceremony — from intimate gatherings to grand receptions.
          </p>

          {/* ── Inline Search Bar ───────────────────────────────── */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search venues by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/10 text-white placeholder-white/40 text-sm rounded-xl border-0 outline-none focus:bg-white/20 transition-colors"
                />
              </div>
              {/* City select */}
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-8 pr-3 py-2.5 bg-white/10 text-white text-sm rounded-xl border-0 outline-none appearance-none cursor-pointer min-w-[130px]"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" className="bg-gray-900">All Cities</option>
                  {CITIES.map((c) => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                </select>
              </div>
              {/* Apply */}
              <button
                onClick={handleApplyFilters}
                className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-xl transition-all shrink-0"
              >
                Search
              </button>
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className="mt-3 inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors"
            >
              <SlidersHorizontal size={12} /> Advanced filters
            </button>
          </div>

          {/* Inline stats strip */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/60 text-xs">
            <div className="flex items-center gap-1.5"><Check size={12} className="text-gold" /> Verified Venues</div>
            <div className="flex items-center gap-1.5"><Check size={12} className="text-gold" /> Real Pricing</div>
            <div className="flex items-center gap-1.5"><Check size={12} className="text-gold" /> Catering Add-ons</div>
            <div className="flex items-center gap-1.5"><Check size={12} className="text-gold" /> Décor Packages</div>
          </div>
        </div>
      </section>

      {/* ── Advanced Filters Panel ──────────────────────────────── */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Guest Capacity</label>
                <div className="relative">
                  <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-xs bg-white appearance-none cursor-pointer focus:outline-none focus:border-gold"
                  >
                    <option value="">Any Capacity</option>
                    {GUEST_CAPACITIES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Price Range</label>
                <div className="relative">
                  <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-xs bg-white appearance-none cursor-pointer focus:outline-none focus:border-gold"
                  >
                    {PRICE_RANGES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Event Date</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-gold [color-scheme:light] cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2 ml-auto">
                {hasActiveFilters && (
                  <button onClick={handleClearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-3 py-2 border border-gray-200 rounded-lg transition-colors">
                    <X size={12} /> Clear
                  </button>
                )}
                <button onClick={handleApplyFilters} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-black hover:bg-gold hover:text-black text-white rounded-lg transition-all">
                  <SlidersHorizontal size={12} /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Filter Pills ─────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="bg-[#f5f3ef] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Filters:</span>
            {city && <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><MapPin size={9} /> {city}</span>}
            {guests && <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Users size={9} /> {guests}</span>}
            {priceRange && priceRange !== "Any Price" && <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">{priceRange}</span>}
            {eventDate && <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Calendar size={9} /> {eventDate}</span>}
          </div>
        </div>
      )}

      {/* ── Main Listings ───────────────────────────────────────── */}
      <main className="bg-[#f5f3ef] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="flex justify-between pt-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle size={36} className="mb-3" />
              <p className="text-sm font-medium mb-4">{error}</p>
              <button
                onClick={() => fetchVenues(city, guests, search, priceRange, eventDate)}
                className="px-4 py-2 text-xs font-bold bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && venues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <MapPin size={40} className="mb-3 text-gray-300" />
              <p className="text-base font-semibold text-gray-600 mb-1">No venues found</p>
              <p className="text-sm text-gray-400 mb-4">Try adjusting your city, capacity, or price filters.</p>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="px-4 py-2 text-xs font-bold text-gold border border-gold/40 rounded-xl hover:bg-gold/5 transition">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && !error && venues.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Showing {venues.length} Venue{venues.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {venues.map((venue, idx) => (
                  <Link
                    key={venue.id}
                    href={`/venues/${venue.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 hover:border-gold/30 hover:-translate-y-0.5"
                  >
                    {/* Card Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-200 shrink-0">
                      <Image
                        src={getVenueImage(venue, idx)}
                        alt={venue.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                      {/* Venue type badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                        {venue.venue_type}
                      </div>

                      {/* City badge */}
                      <div className="absolute top-3 right-3 bg-gold text-black text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <MapPin size={9} /> {venue.city}
                      </div>

                      {/* Bottom overlay: name + price */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          <h3 className="font-heading font-semibold text-white text-base leading-tight flex-1 mr-2 truncate">
                            {venue.name}
                          </h3>
                          <div className="text-right shrink-0">
                            <p className="text-[9px] text-white/60 font-medium">from</p>
                            <p className="text-gold font-bold text-sm">
                              ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
                              <span className="text-[9px] font-normal text-white/50">/day</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-grow space-y-3">
                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <strong className="text-gray-800">{Number(venue.avg_rating || 0).toFixed(1)}</strong>
                        </span>
                        <span className="w-px h-3 bg-gray-200" />
                        <span className="flex items-center gap-1">
                          <Users size={10} className="text-gray-400" />
                          {venue.min_capacity}–{venue.max_capacity} guests
                        </span>
                        {venue.total_bookings > 0 && (
                          <>
                            <span className="w-px h-3 bg-gray-200" />
                            <span>{venue.total_bookings} bookings</span>
                          </>
                        )}
                      </div>

                      {/* Location */}
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <MapPin size={10} className="shrink-0" />
                        {venue.city}, {venue.state}
                      </p>

                      {/* CTA */}
                      <div className="mt-auto pt-1">
                        <div className="w-full flex items-center justify-center gap-1.5 bg-black text-white text-xs font-semibold py-2.5 rounded-xl group-hover:bg-gold group-hover:text-black transition-all duration-300">
                          View Venue Details →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
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
