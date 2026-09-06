"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Heart, MapPin, ShieldCheck, Star, Users } from "lucide-react";

export interface VenueSummary {
  id: number;
  name: string;
  venue_type: string;
  city: string;
  state: string;
  address?: string;
  price_per_day: string;
  avg_rating: string;
  total_bookings: number;
  min_capacity: number | null;
  max_capacity: number;
  num_ac_rooms?: number;
  num_non_ac_rooms?: number;
  num_halls?: number;
  total_rooms?: number;
  is_verified?: boolean;
  primary_image?: string | null;
  gallery?: string[];
  discount_label?: string | null;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
  "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
  "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
];

export const VENUE_TYPE_LABELS: Record<string, string> = {
  wedding_garden: "Wedding Garden",
  banquet_hall: "Banquet Hall",
  resort: "Resort",
  farmhouse: "Farmhouse",
  hotel: "Hotel",
  party_hall: "Party Hall",
  outdoor: "Outdoor Venue",
};

const WISHLIST_KEY = "pmv_wishlist_venues";

function readWishlist(): number[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

/**
 * Listing card. Deliberately fact-first — photo, verification, name, rating,
 * where it is, how many it seats, how many rooms — so a couple can compare a
 * grid of them at a glance rather than opening each one.
 */
export default function VenueCard({ venue, index }: { venue: VenueSummary; index: number }) {
  const photos =
    venue.gallery && venue.gallery.length > 0
      ? venue.gallery
      : [venue.primary_image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]];

  const [slide, setSlide] = useState(0);
  const [wishlisted, setWishlisted] = useState(() =>
    typeof window === "undefined" ? false : readWishlist().includes(venue.id)
  );

  const toggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      // The whole card is a link — don't navigate when the heart is tapped.
      e.preventDefault();
      e.stopPropagation();
      setWishlisted((prev) => {
        const next = !prev;
        try {
          const list = readWishlist().filter((id) => id !== venue.id);
          if (next) list.push(venue.id);
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
        } catch {
          // A private window with storage blocked still gets the visual toggle.
        }
        return next;
      });
    },
    [venue.id]
  );

  const rating = Number(venue.avg_rating ?? 0);
  const rooms = venue.total_rooms ?? (venue.num_ac_rooms || 0) + (venue.num_non_ac_rooms || 0);

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      {/* ── Photo ─────────────────────────────────────────────── */}
      <div className="relative h-56 bg-gray-100 shrink-0 overflow-hidden">
        <Image
          key={photos[slide]}
          src={photos[slide]}
          alt={venue.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          unoptimized
        />

        {venue.is_verified && (
          <span className="absolute top-0 left-0 flex items-center gap-1 pl-2.5 pr-3 py-1.5 text-[10px] font-bold text-white bg-emerald-600 rounded-br-2xl">
            <ShieldCheck size={11} /> KYC Verified
          </span>
        )}

        {venue.discount_label && (
          <span className="absolute top-3 right-12 px-2 py-1 rounded-lg text-[10px] font-bold text-black bg-gold">
            {venue.discount_label}
          </span>
        )}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-rose-500 text-rose-500" : "text-gray-500"}
          />
        </button>

        {/* Carousel dots — only worth showing when there's more than one shot */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSlide(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? "w-4 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Facts ─────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-grow gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold text-[15px] text-gray-900 leading-tight line-clamp-1">
            {venue.name}
          </h3>
          {rating > 0 && (
            <span className="shrink-0 flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-1.5 py-0.5 rounded-md">
              <Star size={10} className="fill-emerald-600 text-emerald-600" />
              {rating.toFixed(1)}
              <span className="font-medium text-emerald-600/80">({venue.total_bookings})</span>
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          <span className="truncate">{venue.city}, {venue.state}</span>
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-gray-400" />
            <strong className="font-semibold text-gray-800">
              {venue.max_capacity?.toLocaleString("en-IN")}
            </strong>
          </span>
          {rooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble size={13} className="text-gray-400" />
              <strong className="font-semibold text-gray-800">{rooms}</strong> Rooms
            </span>
          )}
        </div>

        <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-end justify-between">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            {VENUE_TYPE_LABELS[venue.venue_type] || venue.venue_type}
          </span>
          <span className="text-right">
            <span className="block text-[9px] text-gray-400 leading-none">starting</span>
            <span className="font-bold text-gray-900 text-sm">
              ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
              <span className="text-[10px] font-normal text-gray-400">/day</span>
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
