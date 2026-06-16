"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, use } from "react";
import { MapPin, Star, Users, Check, ArrowRight, IndianRupee, ShieldCheck } from "lucide-react";
import Image from "next/image";

const MOCK_VENUE_DATA: Record<number, any> = {
  1: { id: 1, name: "Royal Gardens Bhopal", venue_type: "Wedding Garden", city: "Bhopal", state: "Madhya Pradesh", price_per_day: "85000.00", avg_rating: "4.8", total_bookings: 142, guests: 800, is_ac: false, has_parking: true, description: "A beautifully manicured open lawn located in the scenic Lalghati area of Bhopal. Perfect for grand Mehendi and Reception events, offering ample parking space and a stunning banquet structure for main ceremonies.", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80" },
  2: { id: 2, name: "Aangan Palace", venue_type: "Banquet Hall", city: "Indore", state: "Madhya Pradesh", price_per_day: "120000.00", avg_rating: "4.6", total_bookings: 98, guests: 400, is_ac: true, has_parking: true, description: "Indore's premiere indoor luxury banquet hall. Fully air-conditioned, featuring elegant crystal chandeliers and premium acoustics for your Sangeet night and main wedding pheras.", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80" },
  3: { id: 3, name: "Shree Residency", venue_type: "Heritage Hotel", city: "Jaipur", state: "Rajasthan", price_per_day: "175000.00", avg_rating: "4.9", total_bookings: 213, guests: 300, is_ac: true, has_parking: true, description: "Immerse your guests in Royal Rajasthani heritage. Features hand-painted fresco ceilings, beautiful inner courtyard architecture, and custom local folk packages.", image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80" },
};

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const venueId = Number(unwrappedParams.id);
  const venue = MOCK_VENUE_DATA[venueId] || MOCK_VENUE_DATA[1];
  const [success, setSuccess] = useState(false);

  const handleBook = () => {
    setSuccess(true);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Media & Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-900">{venue.name}</h1>
                  <span className="bg-amber-500/10 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded">
                    {venue.venue_type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={15} className="text-gray-400" /> {venue.city}, {venue.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={15} className="text-gray-400" /> Max {venue.guests} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={15} className="fill-amber-400 stroke-amber-400" /> {Number(venue.avg_rating || 0).toFixed(1)}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-2">
                  <h3 className="font-heading font-semibold text-lg text-gray-900">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{venue.description}</p>
                </div>

                <hr className="border-gray-100" />

                {/* Features Checklist */}
                <div>
                  <h3 className="font-heading font-semibold text-lg text-gray-900 mb-3">Amenities Included</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Parking Space Included", value: venue.has_parking },
                      { label: "Air Conditioning (AC)", value: venue.is_ac },
                      { label: "Standard Lighting & Generator Backup", value: true },
                      { label: "Complimentary Changing Rooms", value: true },
                    ].map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${amenity.value ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                          <Check size={10} />
                        </div>
                        <span className={amenity.value ? "text-gray-700" : "text-gray-400 line-through"}>{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Booking Widget */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Price Per Day</p>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
                    ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-gray-400">/day (taxes excluded)</span>
                  </h2>
                </div>

                <div className="space-y-3 bg-zinc-50 p-4 rounded-xl text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span>₹{Number(venue.price_per_day).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Catering & Stage Setups</span>
                    <span className="text-amber-600 font-medium">Add-on service option</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                    <span>Estimate Total</span>
                    <span>₹{Number(venue.price_per_day).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {success ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck size={16} /> Booking Request Received
                    </div>
                    <p>Our backend team will verify slots with the venue partner and text your mobile shortly.</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleBook}
                    className="w-full btn-gold py-3 text-sm justify-center rounded-xl"
                  >
                    Check Availability & Book <ArrowRight size={15} />
                  </button>
                )}

                <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <IndianRupee size={10} /> Best Price Guarantee with direct verified contracts
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
