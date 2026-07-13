"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Camera, Check, MessageSquare, MapPin } from "lucide-react";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";

const MOCK_PHOTOGRAPHERS = [
  { 
    id: 201, 
    name: "Golden Hour Studios", 
    type: "Fine Art & Cinematic Films", 
    price: "75,000", 
    rating: "4.9", 
    gear: ["Candid Photography", "Cinematic Videography", "Drone Coverage", "Pre-Wedding Shoot"], 
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", 
    city: "Indore" 
  },
  { 
    id: 202, 
    name: "Memory Makers Wedding Cinema", 
    type: "Traditional & Candid Special", 
    price: "50,000", 
    rating: "4.8", 
    gear: ["Traditional Photography", "Sangeet Highlight Reel", "High-res Albums", "Raw Data Delivery"], 
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", 
    city: "Bhopal" 
  },
];

export default function PhotographyPage() {
  const [success, setSuccess] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<{ id: number; name: string; photographerProfileId: number | null } | null>(null);

  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedPhotographers"],
    queryFn: () => vendorApi.listApprovedVendors("photographer"),
  });

  const photographers = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => {
        const photoProf = v.photographer_profile;
        let startingPrice = "45,000";
        let servicesList = ["Candid Photography", "Traditional Photography", "Drone Cinematography"];
        
        if (photoProf) {
          if (photoProf.starting_price) {
            startingPrice = parseFloat(photoProf.starting_price).toLocaleString("en-IN");
          }
          if (photoProf.services && Array.isArray(photoProf.services) && photoProf.services.length > 0) {
            servicesList = photoProf.services.map((s: any) => s.name);
          } else if (v.details && v.details.photography_types && Array.isArray(v.details.photography_types)) {
            servicesList = v.details.photography_types.map((type: string) => {
              if (type === "candid") return "Candid Photography";
              if (type === "traditional") return "Traditional Photography";
              if (type === "cinematic") return "Cinematic Videography";
              if (type === "drone") return "Drone Coverage";
              if (type === "pre-wedding") return "Pre-Wedding Shoot";
              return type;
            });
          }
        } else if (v.details) {
          if (v.details.base_package_price) {
            startingPrice = parseFloat(v.details.base_package_price).toLocaleString("en-IN");
          }
          if (v.details.services && Array.isArray(v.details.services) && v.details.services.length > 0) {
            servicesList = v.details.services.map((s: any) => s.name);
          } else if (v.details.photography_types && Array.isArray(v.details.photography_types)) {
            servicesList = v.details.photography_types.map((type: string) => {
              if (type === "candid") return "Candid Photography";
              if (type === "traditional") return "Traditional Photography";
              if (type === "cinematic") return "Cinematic Videography";
              if (type === "drone") return "Drone Coverage";
              if (type === "pre-wedding") return "Pre-Wedding Shoot";
              return type;
            });
          }
        }
        
        return {
          id: v.id,
          name: photoProf?.business_name || v.business_name || v.name,
          type: "Wedding Photographer",
          price: startingPrice,
          rating: "4.8",
          gear: servicesList.slice(0, 4),
          image: v.logo || "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80",
          city: photoProf?.city || v.city,
          photographerProfileId: photoProf?.id || null,
        };
      })
    : MOCK_PHOTOGRAPHERS;

  const handleBookClick = (photographer: any) => {
    setSelectedPhotographer({ 
      id: photographer.id, 
      name: photographer.name,
      photographerProfileId: photographer.photographerProfileId 
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-muted flex items-center justify-center text-gold mx-auto" style={{ backgroundColor: 'rgba(201,164,64,0.1)' }}>
              <Camera size={22} className="text-gold" style={{ color: 'var(--gold)' }} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900">Wedding Photographers & Cinema</h1>
            <p className="text-sm text-gray-500">
              Capture every glance, smile, and tear. Explore India's top wedding cinematographers, drone pilots, and fine art candid photographers.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {photographers.map((photographer) => (
                <div key={photographer.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
                  <div className="relative h-56 w-full">
                    <Image
                      src={photographer.image}
                      alt={photographer.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm">
                      {photographer.type}
                    </div>
                    {photographer.city && (
                      <div className="absolute top-4 right-4 bg-zinc-950/90 text-white px-2.5 py-1 rounded text-[11px] font-medium shadow-sm flex items-center gap-1">
                        <MapPin size={10} className="text-gold" style={{ color: 'var(--gold)' }} /> {photographer.city}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-xl text-gray-900">{photographer.name}</h3>
                        <span className="text-sm font-bold text-gold" style={{ color: 'var(--gold)' }}>Starting from ₹{photographer.price}/day</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Services Offered</p>
                        <div className="flex flex-wrap gap-2">
                          {photographer.gear.map((g, idx) => (
                            <span key={idx} className="bg-zinc-50 text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                              <Check size={10} className="text-amber-500" /> {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {success === photographer.id ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold animate-fade-in">
                        Inquiry Sent! Our wedding consultant will contact you.
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBookClick(photographer)}
                        style={{ backgroundColor: 'var(--gold)', color: '#0A192F' }}
                        className="w-full py-2.5 text-xs font-bold justify-center rounded-xl cursor-pointer flex items-center gap-1.5 hover:opacity-95 transition-all"
                      >
                        Check Availability & Book Photographer <MessageSquare size={13} />
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

      {selectedPhotographer && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(selectedPhotographer.id)}
          vendorName={selectedPhotographer.name}
          serviceType="photographer"
          photographerProfileId={selectedPhotographer.photographerProfileId}
        />
      )}
    </>
  );
}
