"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
  "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
];

const MOCK_VENUES = [
  { id: 1, name: "Royal Gardens Bhopal", venue_type: "Wedding Garden", city: "Bhopal", state: "Madhya Pradesh", price_per_day: "85000.00", avg_rating: "4.8", total_bookings: 142, guests: 800 },
  { id: 2, name: "Aangan Palace", venue_type: "Banquet Hall", city: "Indore", state: "Madhya Pradesh", price_per_day: "120000.00", avg_rating: "4.6", total_bookings: 98, guests: 400 },
  { id: 3, name: "Shree Residency", venue_type: "Heritage Hotel", city: "Jaipur", state: "Rajasthan", price_per_day: "175000.00", avg_rating: "4.9", total_bookings: 213, guests: 300 },
];

export default function VenuesPage() {
  const [city, setCity] = useState("All");

  const filteredVenues = city === "All" 
    ? MOCK_VENUES 
    : MOCK_VENUES.filter(v => v.city.toLowerCase() === city.toLowerCase());

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-heading font-semibold text-gray-900">Discover Celebration Venues</h1>
            <p className="text-sm text-gray-500">Find the perfect backdrop for your wedding ceremonies</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search venues..." 
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none w-full md:w-64"
                />
              </div>
              
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white appearance-none cursor-pointer"
                  aria-label="Filter by city"
                >
                  <option value="All">All Cities</option>
                  <option value="Bhopal">Bhopal</option>
                  <option value="Indore">Indore</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>
            </div>

            <button className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto justify-center">
              <SlidersHorizontal size={14} />
              More Filters
            </button>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredVenues.map((venue, idx) => (
              <Link key={venue.id} href={`/venues/${venue.id}`}>
                <div className="venue-card group cursor-pointer bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image
                      src={VENUE_IMAGES[idx % VENUE_IMAGES.length]}
                      alt={venue.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
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
                        <span className="text-xs font-semibold text-gray-800">{Number(venue.avg_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                      <MapPin size={12} className="text-gray-400" /> {venue.city}, {venue.state}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <span className="text-sm font-bold text-gray-900">₹{Number(venue.price_per_day).toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-gray-500"> /day</span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{venue.guests} guests max</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
