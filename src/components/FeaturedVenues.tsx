"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Heart, MapPin, Star, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";

interface Venue {
  id: number;
  name: string;
  venue_type: string;
  city: string;
  state: string;
  price_per_day: string;
  avg_rating: string;
  total_bookings: number;
  has_parking: boolean;
  is_ac: boolean;
  min_capacity?: number;
  max_capacity?: number;
  primary_image?: string | null;
}

// Fallback placeholder data for when API is not reachable
const PLACEHOLDER_VENUES: Venue[] = [
  { id: 1, name: "Royal Gardens Bhopal", venue_type: "Wedding Garden", city: "Bhopal", state: "Madhya Pradesh", price_per_day: "85000.00", avg_rating: "4.8", total_bookings: 142, has_parking: true, is_ac: false },
  { id: 2, name: "Aangan Palace", venue_type: "Banquet Hall", city: "Indore", state: "Madhya Pradesh", price_per_day: "120000.00", avg_rating: "4.6", total_bookings: 98, has_parking: true, is_ac: true },
  { id: 3, name: "Shree Residency", venue_type: "Heritage Hotel", city: "Jaipur", state: "Rajasthan", price_per_day: "175000.00", avg_rating: "4.9", total_bookings: 213, has_parking: true, is_ac: true },
  { id: 4, name: "Green Meadows Farm", venue_type: "Farmhouse", city: "Bhopal", state: "Madhya Pradesh", price_per_day: "55000.00", avg_rating: "4.5", total_bookings: 67, has_parking: true, is_ac: false },
  { id: 5, name: "Skyline Rooftop", venue_type: "Rooftop Venue", city: "Delhi", state: "Delhi", price_per_day: "95000.00", avg_rating: "4.7", total_bookings: 89, has_parking: false, is_ac: false },
  { id: 6, name: "Lakewood Resort", venue_type: "Luxury Resort", city: "Udaipur", state: "Rajasthan", price_per_day: "250000.00", avg_rating: "5.0", total_bookings: 55, has_parking: true, is_ac: true },
];

// Curated images for placeholder venues (Unsplash)
const VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
  "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80",
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80",
  "https://images.unsplash.com/photo-1621862390673-8d27bb72d804?w=600&q=80",
];

function formatPrice(price: string) {
  const n = Math.round(Number(price));
  return "₹" + n.toLocaleString("en-IN");
}

function VenueCard({ venue, index, rank }: { venue: Venue; index: number; rank: number }) {
  const [wishlisted, setWishlisted] = useState(false);

  const bookings = venue.total_bookings || 0;
  const rating = Number(venue.avg_rating ?? 0);
  // Only the leaders earn a badge — a badge on every card says nothing.
  const highlight =
    rank === 0 && bookings > 0
      ? { icon: Flame, label: "Most booked", tone: "bg-rose-500/90" }
      : bookings >= 25
        ? { icon: TrendingUp, label: `${bookings} bookings`, tone: "bg-emerald-600/90" }
        : rating >= 4.7
          ? { icon: Star, label: "Top rated", tone: "bg-amber-500/90" }
          : null;
  const HighlightIcon = highlight?.icon;

  return (
    <div className="venue-card group shadow-gold-hover border border-transparent">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <Image
          src={venue.primary_image || VENUE_IMAGES[index % VENUE_IMAGES.length]}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {highlight && HighlightIcon && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white backdrop-blur-sm ${highlight.tone}`}>
            <HighlightIcon size={10} /> {highlight.label}
          </div>
        )}
        {/* Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold"
          style={{
            background: "rgba(5,13,26,0.82)",
            color: "var(--white)",
            backdropFilter: "blur(4px)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {venue.venue_type}
        </div>
        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
          }}
          aria-label="Add to wishlist"
        >
          <Heart
            size={15}
            style={{
              fill: wishlisted ? "#ef4444" : "none",
              color: wishlisted ? "#ef4444" : "#6b7280",
            }}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-heading font-semibold mb-1 truncate"
          style={{ color: "var(--text-dark)", fontSize: "1rem" }}
        >
          {venue.name}
        </h3>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} style={{ color: "var(--text-lighter)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              {venue.city}, {venue.state}
            </span>
          </span>
          {venue.max_capacity ? (
            <span className="flex items-center gap-1.5">
              <Users size={12} style={{ color: "var(--text-lighter)" }} />
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                up to {venue.max_capacity.toLocaleString("en-IN")}
              </span>
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span
              className="font-semibold"
              style={{ color: "var(--text-dark)", fontSize: "0.95rem" }}
            >
              {formatPrice(venue.price_per_day)}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {" "}/day
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={13} style={{ fill: "var(--gold)", color: "var(--gold)" }} />
            <span
              className="font-medium text-sm"
              style={{ color: "var(--text-dark)" }}
            >
              {Number(venue.avg_rating ?? 0).toFixed(1)}
            </span>
            <span style={{ color: "var(--text-lighter)", fontSize: "0.75rem" }}>
              ({venue.total_bookings})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // `ordering=popular` sorts by bookings first, rating as the tie-break —
    // the venues couples actually choose, not just the best-rated empty ones.
    api
      .get("/venues/venues/?ordering=popular&page_size=6")
      .then((res) => {
        const results = res.data?.results || res.data?.data?.results || [];
        setVenues(results.length > 0 ? results.slice(0, 6) : PLACEHOLDER_VENUES);
      })
      .catch(() => setVenues(PLACEHOLDER_VENUES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-4">Most Booked &amp; Top Rated</p>
            <h2
              className="font-heading"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--text-dark)",
                lineHeight: 1.2,
              }}
            >
              Spaces worthy of{" "}
              <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
                your
              </em>{" "}
              shaadi.
            </h2>
            <p className="text-gray-500 text-sm mt-3 max-w-md">
              The venues couples book most on PlanMyVivah, ranked by real bookings and ratings.
            </p>
          </div>
          <Link
            href="/venues"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all"
            style={{ color: "var(--text-dark)" }}
          >
            Explore all venues <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="skeleton h-52 w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((v, i) => (
              <Link key={v.id} href={`/venues/${v.id}`}>
                <VenueCard venue={v} index={i} rank={i} />
              </Link>
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-10 text-center md:hidden">
          <Link href="/venues" className="btn-gold">
            Explore All Venues <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
