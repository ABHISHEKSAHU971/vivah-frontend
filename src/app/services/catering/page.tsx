"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Utensils, Check, MessageSquare } from "lucide-react";

const CATERERS = [
  { id: 1, name: "Annapurna Caterers", type: "Veg & Jain Special", price_per_plate: "450", rating: "4.8", specialties: ["Traditional Rajasthani", "Gujarati Counters", "Custom Jain Menu"], image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80" },
  { id: 2, name: "Royal Kitchens", type: "Multi-Cuisine Fusion", price_per_plate: "750", rating: "4.9", specialties: ["Mughlai Specialties", "Live Pasta Counter", "Italian & Continental"], image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80" },
];

export default function CateringPage() {
  const [success, setSuccess] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-muted flex items-center justify-center text-gold mx-auto">
              <Utensils size={22} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900">Curated Catering Partners</h1>
            <p className="text-sm text-gray-500">
              Hire premium wedding caterers for individual pre-wedding functions or the grand reception. Book catering separately or alongside your venue slot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {CATERERS.map((caterer) => (
              <div key={caterer.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
                <div className="relative h-56 w-full">
                  <Image
                    src={caterer.image}
                    alt={caterer.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm">
                    {caterer.type}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-xl text-gray-900">{caterer.name}</h3>
                      <span className="text-sm font-bold text-gold">₹{caterer.price_per_plate}/plate</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Cuisine Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {caterer.specialties.map((s, idx) => (
                          <span key={idx} className="bg-zinc-50 text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                            <Check size={10} className="text-emerald-500" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {success === caterer.id ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold">
                      Inquiry Sent! Our catering manager will contact you.
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSuccess(caterer.id)}
                      className="w-full btn-gold py-2.5 text-xs justify-center rounded-xl"
                    >
                      Request Call & Menu Customization <MessageSquare size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
