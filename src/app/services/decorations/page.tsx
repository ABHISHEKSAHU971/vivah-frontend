"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Palette, Check, MessageSquare, MapPin } from "lucide-react";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";

const MOCK_DECORATORS = [
  { id: 101, name: "Vedic Mandaps", type: "Traditional Floral Setups", price_range: "80,000 - 2,50,000", rating: "4.8", packages: ["Fairy Light Walkway", "Marigold Floral Mandap", "Haldi Jhoola Canopy"], image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80", city: "Bhopal" },
  { id: 102, name: "Luxe Designs", type: "Bollywood Stages", price_range: "1,50,000 - 5,00,000", rating: "4.9", packages: ["Mirror Stage Flooring", "Orchid & Rose Floral Wall", "Drape & Chandelier Lighting"], image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80", city: "Indore" },
];

export default function DecorationsPage() {
  const [success, setSuccess] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecorator, setSelectedDecorator] = useState<{ id: number; name: string } | null>(null);

  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedDecorators"],
    queryFn: () => vendorApi.listApprovedVendors("decorator"),
  });

  const decorators = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => ({
        id: v.id,
        name: v.business_name,
        type: v.vendor_type || "Decoration Specialist",
        price_range: "75,000 - 3,00,000",
        rating: "4.8",
        packages: v.description 
          ? v.description.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3) 
          : ["Mandap Decoration", "Reception Stage", "Lighting Design"],
        image: v.logo || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
        city: v.city,
      }))
    : MOCK_DECORATORS;

  const handleBookClick = (decorator: any) => {
    setSelectedDecorator({ id: decorator.id, name: decorator.name });
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-muted flex items-center justify-center text-gold mx-auto">
              <Palette size={22} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900">Decoration Specialists</h1>
            <p className="text-sm text-gray-500">
              Browse customized stage, mandap, and walkway setups by professional wedding decor designers in your city.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {decorators.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
                  <div className="relative h-56 w-full">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm">
                      {d.type}
                    </div>
                    {d.city && (
                      <div className="absolute top-4 right-4 bg-zinc-900/90 text-white px-2.5 py-1 rounded text-[11px] font-medium shadow-sm flex items-center gap-1">
                        <MapPin size={10} className="text-gold" /> {d.city}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-xl text-gray-900">{d.name}</h3>
                        <span className="text-sm font-bold text-gold">₹{d.price_range}</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Packages Include</p>
                        <div className="flex flex-wrap gap-2">
                          {d.packages.map((pkg, idx) => (
                            <span key={idx} className="bg-zinc-50 text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                              <Check size={10} className="text-amber-500" /> {pkg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {success === d.id ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold animate-fade-in">
                        Inquiry Sent! Our decor coordinator will contact you.
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBookClick(d)}
                        className="w-full btn-gold py-2.5 text-xs justify-center rounded-xl cursor-pointer"
                      >
                        Request Consultation & Custom Quote <MessageSquare size={13} />
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

      {selectedDecorator && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(selectedDecorator.id)}
          vendorName={selectedDecorator.name}
          serviceType="decorator"
          decorationPackageId={selectedDecorator.id < 100 ? selectedDecorator.id : null}
        />
      )}
    </>
  );
}
