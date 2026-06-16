"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Palette, Check, MessageSquare } from "lucide-react";

const DECORATORS = [
  { id: 1, name: "Vedic Mandaps", type: "Traditional Floral Setups", price_range: "80,000 - 2,500,000", rating: "4.8", packages: ["Fairy Light Walkway", "Marigold Floral Mandap", "Haldi Jhoola Canopy"], image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80" },
  { id: 2, name: "Luxe Designs", type: "Bollywood Stages", price_range: "1,50,000 - 5,00,000", rating: "4.9", packages: ["Mirror Stage Flooring", "Orchid & Rose Floral Wall", "Drape & Chandelier Lighting"], image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80" },
];

export default function DecorationsPage() {
  const [success, setSuccess] = useState<number | null>(null);

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {DECORATORS.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
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
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold">
                      Inquiry Sent! Our decor coordinator will contact you.
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSuccess(d.id)}
                      className="w-full btn-gold py-2.5 text-xs justify-center rounded-xl"
                    >
                      Request Consultation & Custom Quote <MessageSquare size={13} />
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
