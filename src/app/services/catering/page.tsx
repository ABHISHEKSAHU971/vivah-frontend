"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCategoryStrip from "@/components/ServiceCategoryStrip";
import ServiceBriefBar, { matchesCity, useServiceBrief } from "@/components/ServiceBriefBar";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Utensils, Check, MapPin, ArrowRight, Star, ChefHat, Clock, Users } from "lucide-react";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/api";

const MOCK_CATERERS = [
  { 
    id: 101, 
    name: "Annapurna Caterers", 
    type: "Rajasthani & Gujarati & Jain", 
    price_per_plate: "350", 
    rating: "4.8", 
    total_reviews: 124,
    min_guests: 50,
    specialties: ["Rajasthani Specialties", "Gujarati Counters", "Custom Jain Menu"], 
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80", 
    city: "Indore",
    packages_count: 2,
  },
  { 
    id: 102, 
    name: "Royal Kitchens", 
    type: "Multi-Cuisine & Continental", 
    price_per_plate: "600", 
    rating: "4.9", 
    total_reviews: 98,
    min_guests: 100,
    specialties: ["Multi-Cuisine Fusion", "Continental Delicacies", "South Indian Counters"], 
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", 
    city: "Bhopal",
    packages_count: 1,
  },
];

const CUISINE_ICONS: Record<string, string> = {
  rajasthani: "🥘", gujarati: "🫓", jain: "🌿",
  multi: "🍽️", continental: "🥗", south_indian: "🫙",
};

function CateringPageContent() {
  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedCaterers"],
    queryFn: () => vendorApi.listApprovedVendors("caterer"),
  });

  const allCaterers = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => {
        const biz = v.catering_business;
        const packages = biz?.packages || [];
        let minPrice = Infinity;
        packages.forEach((pkg: any) => {
          const pWith = parseFloat(pkg.price_per_plate);
          const pWithout = parseFloat(pkg.price_per_plate_without_material);
          if (pWith > 0 && pWith < minPrice) minPrice = pWith;
          if (pWithout > 0 && pWithout < minPrice) minPrice = pWithout;
        });
        const formattedCuisines = biz?.cuisines?.map((c: string) => {
          if (c === "rajasthani") return "Rajasthani Specialties";
          if (c === "gujarati") return "Gujarati Counters";
          if (c === "jain") return "Custom Jain Menu";
          if (c === "multi") return "Multi-Cuisine Fusion";
          if (c === "continental") return "Continental Delicacies";
          if (c === "south_indian") return "South Indian Counters";
          return c.charAt(0).toUpperCase() + c.slice(1);
        }) || [];
        return {
          id: v.id,
          name: biz?.brand_name || v.business_name,
          type: biz?.cuisines?.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(" & ") || v.vendor_type,
          price_per_plate: minPrice !== Infinity ? String(Math.floor(minPrice)) : "500",
          rating: "4.8",
          total_reviews: 89,
          min_guests: biz?.min_guests || 50,
          specialties: formattedCuisines.length > 0 ? formattedCuisines : ["Custom Wedding Menus", "Multi-Cuisine"],
          image: getImageUrl(biz?.logo_url || v.cover_image || v.logo) || "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
          city: biz?.city || v.city,
          packages_count: packages.length,
          cuisines: biz?.cuisines || [],
        };
      })
    : MOCK_CATERERS;

  // The discovery gate puts the couple's city in the URL — honour it here
  // rather than showing every vendor in the country.
  const brief = useServiceBrief();
  const caterers = allCaterers.filter((v) => matchesCity(v.city, brief.city));

  return (
    <>
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="relative pt-16 pb-0 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-1.5 rounded-full text-[11px] font-semibold text-gold uppercase tracking-wider mb-6">
            <ChefHat size={13} /> Premium Catering Partners
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-white mb-4 leading-tight">
            Curated Wedding<br />
            <span className="text-gold italic">Catering Experiences</span>
          </h1>
          <p className="text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
            Book premium caterers for your pre-wedding functions or the grand reception — independently or alongside your venue.
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-xs">
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> 100% Verified Caterers</div>
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> Transparent Menu Pricing</div>
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> Material & Non-Material Plans</div>
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> Custom Menu on Request</div>
          </div>
        </div>
      </section>

      <ServiceCategoryStrip active="catering" />
      <ServiceBriefBar basePath="/services/catering" resultCount={caterers.length} noun="caterer" />

      {/* ── Listing Grid ────────────────────────────────────────── */}
      <main className="bg-[#f5f3ef] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Showing {caterers.length} Catering Partner{caterers.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {caterers.map((caterer: any) => (
                  <Link
                    key={caterer.id}
                    href={`/services/catering/${caterer.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 hover:border-gold/30 hover:-translate-y-0.5"
                  >
                    {/* Card Image */}
                    <div className="relative h-52 overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={caterer.image}
                        alt={caterer.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Cuisine type badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg max-w-[60%] truncate">
                        {caterer.type}
                      </div>

                      {/* City badge */}
                      {caterer.city && (
                        <div className="absolute top-3 right-3 bg-gold text-black text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <MapPin size={9} /> {caterer.city}
                        </div>
                      )}

                      {/* Bottom overlay: name + price */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          <h3 className="font-heading font-semibold text-white text-base leading-tight">{caterer.name}</h3>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-[9px] text-white/70 font-medium">Starting</p>
                            <p className="text-gold font-bold text-sm">₹{caterer.price_per_plate}<span className="text-[9px] font-normal text-white/60">/plate</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-grow space-y-3">
                      {/* Stats Row */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <strong className="text-gray-800">{caterer.rating}</strong>
                          <span className="text-gray-400">({caterer.total_reviews})</span>
                        </span>
                        <span className="w-px h-3 bg-gray-200" />
                        <span className="flex items-center gap-1">
                          <Users size={10} className="text-gray-400" />
                          Min {caterer.min_guests} guests
                        </span>
                        {caterer.packages_count > 0 && (
                          <>
                            <span className="w-px h-3 bg-gray-200" />
                            <span className="flex items-center gap-1">
                              <Utensils size={10} className="text-gray-400" />
                              {caterer.packages_count} package{caterer.packages_count > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5">
                        {caterer.specialties.slice(0, 3).map((s: string, idx: number) => (
                          <span key={idx} className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-full border border-amber-100 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-auto pt-2">
                        <div className="w-full flex items-center justify-center gap-1.5 bg-black text-white text-xs font-semibold py-2.5 rounded-xl group-hover:bg-gold group-hover:text-black transition-all duration-300">
                          View Packages & Details <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
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

export default function CateringPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f3ef]" />}>
      <CateringPageContent />
    </Suspense>
  );
}
