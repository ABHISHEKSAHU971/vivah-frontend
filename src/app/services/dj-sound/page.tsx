"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Music, Check, MessageSquare, MapPin } from "lucide-react";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";

const MOCK_DJS = [
  { id: 101, name: "DJ Rohit & LED Sound", type: "Full Sound & Lighting", price: "45,000", rating: "4.8", gear: ["JBL VRX Line Array", "LED Stage backdrop", "Smoke & Spark Machines"], image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80", city: "Indore" },
  { id: 102, name: "Soundwave Entertainment", type: "Sangeet Special DJ & Dhol", price: "60,000", rating: "4.9", gear: ["RCF Sound System", "Punjabi Dhol Artists", "Laser & Truss Setup"], image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80", city: "Bhopal" },
];

export default function DjSoundPage() {
  const [success, setSuccess] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDj, setSelectedDj] = useState<{ id: number; name: string } | null>(null);

  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedDjs"],
    queryFn: () => vendorApi.listApprovedVendors("dj"),
  });

  const djs = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => ({
        id: v.id,
        name: v.business_name,
        type: v.vendor_type || "DJ / Sound Artist",
        price: "40,000",
        rating: "4.8",
        gear: v.description 
          ? v.description.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3) 
          : ["JBL Professional Audio", "LED Intelligent Lighting", "Live DJ Setup"],
        image: v.logo || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
        city: v.city,
      }))
    : MOCK_DJS;

  const handleBookClick = (dj: any) => {
    setSelectedDj({ id: dj.id, name: dj.name });
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-muted flex items-center justify-center text-gold mx-auto">
              <Music size={22} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900">DJ & Sound System Partners</h1>
            <p className="text-sm text-gray-500">
              Get premium JBL line-arrays, LED wall stages, truss light grids, and live Dhol players for your Sangeet, Mehendi, and Baraat.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {djs.map((dj) => (
                <div key={dj.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
                  <div className="relative h-56 w-full">
                    <Image
                      src={dj.image}
                      alt={dj.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm">
                      {dj.type}
                    </div>
                    {dj.city && (
                      <div className="absolute top-4 right-4 bg-zinc-950/90 text-white px-2.5 py-1 rounded text-[11px] font-medium shadow-sm flex items-center gap-1">
                        <MapPin size={10} className="text-gold" /> {dj.city}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-xl text-gray-900">{dj.name}</h3>
                        <span className="text-sm font-bold text-gold">Starting from ₹{dj.price}/event</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gear & Artistes Included</p>
                        <div className="flex flex-wrap gap-2">
                          {dj.gear.map((g, idx) => (
                            <span key={idx} className="bg-zinc-50 text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                              <Check size={10} className="text-amber-500" /> {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {success === dj.id ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold animate-fade-in">
                        Inquiry Sent! Our entertainment manager will contact you.
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBookClick(dj)}
                        className="w-full btn-gold py-2.5 text-xs justify-center rounded-xl cursor-pointer"
                      >
                        Check Availability & Book DJ <MessageSquare size={13} />
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

      {selectedDj && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(selectedDj.id)}
          vendorName={selectedDj.name}
          serviceType="dj"
        />
      )}
    </>
  );
}
