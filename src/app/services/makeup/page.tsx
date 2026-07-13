"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Sparkles, Check, MessageSquare, MapPin } from "lucide-react";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";

const MOCK_MAKEUP_ARTISTS = [
  { 
    id: 201, 
    name: "Glitz & Glam Bridal Studio", 
    type: "Bridal Makeup Artist", 
    price: "15,000", 
    rating: "4.9", 
    brands: ["MAC", "Huda Beauty", "NARS"], 
    packages: ["Silver Package: Bridal HD Makeup", "Gold Package: Airbrush Bridal Look", "Platinum Package: Luxury International styling"], 
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", 
    city: "Bhopal" 
  },
  { 
    id: 202, 
    name: "Elegant Makeovers by Aditi", 
    type: "Premium Celebrity Artist", 
    price: "22,000", 
    rating: "4.8", 
    brands: ["MAC", "Sephora", "Estee Lauder", "Bobbi Brown"], 
    packages: ["Gold Package: HD Makeup + Hair styling", "Platinum Package: Premium Airbrush HD Look + Trial"], 
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80", 
    city: "Indore" 
  },
];

export default function MakeupPage() {
  const [success, setSuccess] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMakeup, setSelectedMakeup] = useState<{ id: number; name: string } | null>(null);

  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedMakeupArtists"],
    queryFn: () => vendorApi.listApprovedVendors("makeup"),
  });

  const artists = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => {
        const details = v.details || {};
        const packagesList = details.packages || [];

        const bridalPkgs = packagesList
          .filter((p: any) => p.category === "bridal" || !p.category)
          .map((p: any) => `${p.name}: ₹${parseFloat(p.price || 0).toLocaleString("en-IN")} (${p.inclusions || "Bridal Look"})`);

        const groomPkgs = packagesList
          .filter((p: any) => p.category === "groom")
          .map((p: any) => `${p.name}: ₹${parseFloat(p.price || 0).toLocaleString("en-IN")} (${p.inclusions || "Grooming Look"})`);

        const startingPriceVal = details.bridal_package_price 
          ? parseFloat(details.bridal_package_price).toLocaleString("en-IN")
          : packagesList?.[0]?.price 
          ? parseFloat(packagesList[0].price).toLocaleString("en-IN") 
          : "12,000";

        return {
          id: v.id,
          name: v.business_name || v.name,
          type: "Bridal & Groom Makeup Artist",
          price: startingPriceVal,
          rating: "4.8",
          brands: details.brands_used && details.brands_used.length > 0 ? details.brands_used : ["MAC", "Huda Beauty"],
          bridalPackages: bridalPkgs.length > 0 ? bridalPkgs : ["Silver: Professional HD Makeup", "Gold: Airbrush Makeup & Styling", "Platinum: Trial + Luxury Bridal Makeover"],
          groomPackages: groomPkgs.length > 0 ? groomPkgs : ["Silver: Basic Grooming & Styling", "Gold: HD Groom Makeup", "Platinum: Premium Groom Makeover & Hair Set"],
          image: v.logo || "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
          city: v.city,
        };
      })
    : MOCK_MAKEUP_ARTISTS.map(m => ({
        ...m,
        bridalPackages: m.packages,
        groomPackages: ["Silver: Basic Grooming & Styling", "Gold: HD Groom Makeup", "Platinum: Premium Groom Makeover & Hair Set"]
      }));

  const handleBookClick = (artist: any) => {
    setSelectedMakeup({ id: artist.id, name: artist.name });
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-muted flex items-center justify-center text-gold mx-auto" style={{ backgroundColor: 'rgba(201,164,64,0.1)' }}>
              <Sparkles size={22} className="text-gold" style={{ color: 'var(--gold)' }} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900">Wedding Makeup Artists</h1>
            <p className="text-sm text-gray-500">
              Find luxury airbrush, HD, and traditional makeup artists to curate your perfect bridal and groom looks.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {artists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
                  <div className="relative h-56 w-full">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm">
                      {artist.type}
                    </div>
                    {artist.city && (
                      <div className="absolute top-4 right-4 bg-zinc-950/90 text-white px-2.5 py-1 rounded text-[11px] font-medium shadow-sm flex items-center gap-1">
                        <MapPin size={10} className="text-gold" style={{ color: 'var(--gold)' }} /> {artist.city}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-xl text-gray-900">{artist.name}</h3>
                        <span className="text-sm font-bold text-gold" style={{ color: 'var(--gold)' }}>Starting from ₹{artist.price}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Brands Customarily Used</p>
                        <div className="flex flex-wrap gap-1.5">
                          {artist.brands.map((b, i) => (
                            <span key={i} className="bg-slate-50 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-100">{b}</span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bridal Packages</p>
                          <div className="space-y-1">
                            {artist.bridalPackages.map((pkg, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                                <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>{pkg}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Groom Packages</p>
                          <div className="space-y-1">
                            {artist.groomPackages.map((pkg, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                                <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>{pkg}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {success === artist.id ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold animate-fade-in">
                        Inquiry Sent! The artist will contact you.
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBookClick(artist)}
                        style={{ backgroundColor: 'var(--gold)', color: '#0A192F' }}
                        className="w-full py-2.5 text-xs font-bold justify-center rounded-xl cursor-pointer flex items-center gap-1.5 hover:opacity-95 transition-all"
                      >
                        Check Availability & Book Artist <MessageSquare size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />

      {selectedMakeup && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(selectedMakeup.id)}
          vendorName={selectedMakeup.name}
          serviceType="makeup"
        />
      )}
    </>
  );
}
