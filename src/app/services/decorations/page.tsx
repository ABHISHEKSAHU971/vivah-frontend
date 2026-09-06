"use client";

import Navbar from "@/components/Navbar";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import ServiceCategoryStrip from "@/components/ServiceCategoryStrip";
import ServiceBriefBar, { matchesCity, useServiceBrief } from "@/components/ServiceBriefBar";
import Link from "next/link";
import { Check, MapPin, ArrowRight, Star, Palette, Sparkles } from "lucide-react";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/api";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";

const STYLE_LABELS: Record<string, string> = {
  royal: "Royal",
  floral: "Floral",
  minimal: "Minimal Luxury",
  bollywood: "Bollywood",
  traditional: "Traditional",
  modern: "Modern Premium",
  cultural: "Cultural",
  outdoor: "Outdoor Garden",
};

const MOCK_DECORATORS = [
  {
    id: 101,
    name: "Vedic Mandaps",
    type: "Traditional Floral Setups",
    price: "80000",
    rating: "4.8",
    total_reviews: 112,
    specialties: ["Fairy Light Walkway", "Marigold Floral Mandap", "Haldi Jhoola Canopy"],
    image: FALLBACK_IMAGE,
    city: "Bhopal",
    packages_count: 2,
    themes_count: 2,
  },
  {
    id: 102,
    name: "Luxe Designs",
    type: "Bollywood Stages",
    price: "150000",
    rating: "4.9",
    total_reviews: 86,
    specialties: ["Mirror Stage Flooring", "Orchid & Rose Floral Wall", "Drape & Chandelier Lighting"],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    city: "Indore",
    packages_count: 1,
    themes_count: 1,
  },
];

function minPackagePrice(packages: any[]): number | null {
  let minPrice = Infinity;
  (packages || []).forEach((pkg: any) => {
    (pkg.tiers || []).forEach((tier: any) => {
      const price = parseFloat(tier.price);
      if (price > 0 && price < minPrice) minPrice = price;
    });
  });
  return minPrice === Infinity ? null : Math.floor(minPrice);
}

function DecorationsPageContent() {
  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedDecorators"],
    queryFn: () => vendorApi.listApprovedVendors("decorator"),
  });

  const allDecorators = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => {
        const packages = v.decoration_packages || [];
        const styles = [...new Set(packages.map((pkg: any) => STYLE_LABELS[pkg.style] || pkg.style).filter(Boolean))];
        const inclusions = packages.flatMap((pkg: any) => pkg.includes || []).slice(0, 3);
        const price = minPackagePrice(packages);
        const tierCount = packages.reduce((sum: number, pkg: any) => sum + (pkg.tiers?.length || 0), 0);
        return {
          id: v.id,
          name: v.business_name || packages[0]?.name || v.name,
          type: styles.join(" & ") || "Decoration Specialist",
          price: price != null ? String(price) : "75000",
          rating: "4.8",
          total_reviews: 89,
          specialties: inclusions.length > 0 ? inclusions : styles.length > 0 ? styles : ["Mandap Decoration", "Reception Stage", "Lighting Design"],
          image: getImageUrl(v.cover_image || packages[0]?.image || v.logo) || FALLBACK_IMAGE,
          city: v.city,
          packages_count: tierCount || packages.length,
          themes_count: packages.length,
        };
      })
    : MOCK_DECORATORS;

  // The discovery gate puts the couple's city in the URL — honour it here
  // rather than showing every vendor in the country.
  const brief = useServiceBrief();
  const decorators = allDecorators.filter((v) => matchesCity(v.city, brief.city));

  return (
    <>
      <Navbar />

      <section className="relative pt-16 pb-0 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-1.5 rounded-full text-[11px] font-semibold text-gold uppercase tracking-wider mb-6">
            <Palette size={13} /> Premium Decoration Partners
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold text-white mb-4 leading-tight">
            Curated Wedding<br />
            <span className="text-gold italic">Decoration Experiences</span>
          </h1>
          <p className="text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
            Browse mandap, stage, and floral setups by verified decor designers — independently or alongside your venue.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-xs">
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> 100% Verified Decorators</div>
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> Transparent Package Pricing</div>
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> Mandap, Stage & Lighting</div>
            <div className="flex items-center gap-1.5"><Check size={13} className="text-gold" /> Custom Themes on Request</div>
          </div>
        </div>
      </section>

      <ServiceCategoryStrip active="decorations" />
      <ServiceBriefBar basePath="/services/decorations" resultCount={decorators.length} noun="decorator" />

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
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Showing {decorators.length} Decoration Partner{decorators.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {decorators.map((decorator: any) => (
                  <Link
                    key={decorator.id}
                    href={`/services/decorations/${decorator.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 hover:border-gold/30 hover:-translate-y-0.5"
                  >
                    <div className="relative h-52 overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={decorator.image}
                        alt={decorator.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg max-w-[60%] truncate">
                        {decorator.type}
                      </div>
                      {decorator.city && (
                        <div className="absolute top-3 right-3 bg-gold text-black text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <MapPin size={9} /> {decorator.city}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          <h3 className="font-heading font-semibold text-white text-base leading-tight">{decorator.name}</h3>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-[9px] text-white/70 font-medium">Starting</p>
                            <p className="text-gold font-bold text-sm">₹{Number(decorator.price).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow space-y-3">
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <strong className="text-gray-800">{decorator.rating}</strong>
                          <span className="text-gray-400">({decorator.total_reviews})</span>
                        </span>
                        {decorator.themes_count > 0 && (
                          <>
                            <span className="w-px h-3 bg-gray-200" />
                            <span className="flex items-center gap-1">
                              <Palette size={10} className="text-gray-400" />
                              {decorator.themes_count} theme{decorator.themes_count > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                        {decorator.packages_count > 0 && (
                          <>
                            <span className="w-px h-3 bg-gray-200" />
                            <span className="flex items-center gap-1">
                              <Sparkles size={10} className="text-gray-400" />
                              {decorator.packages_count} package{decorator.packages_count > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {decorator.specialties.slice(0, 3).map((s: string, idx: number) => (
                          <span key={idx} className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-full border border-amber-100 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>

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

export default function DecorationsPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f3ef]" />}>
      <DecorationsPageContent />
    </Suspense>
  );
}
