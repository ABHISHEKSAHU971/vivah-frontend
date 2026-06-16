"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Music, Check, MessageSquare } from "lucide-react";

const DJS = [
  { id: 1, name: "DJ Rohit & LED Sound", type: "Full Sound & Lighting", price: "45,000", rating: "4.8", gear: ["JBL VRX Line Array", "LED Stage backdrop", "Smoke & Spark Machines"], image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80" },
  { id: 2, name: "Soundwave Entertainment", type: "Sangeet Special DJ & Dhol", price: "60,000", rating: "4.9", gear: ["RCF Sound System", "Punjabi Dhol Artists", "Laser & Truss Setup"], image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80" },
];

export default function DjSoundPage() {
  const [success, setSuccess] = useState<number | null>(null);

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {DJS.map((dj) => (
              <div key={dj.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
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
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-xl text-gray-900">{dj.name}</h3>
                      <span className="text-sm font-bold text-gold">₹{dj.price}/event</span>
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
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-center font-semibold">
                      Inquiry Sent! Our entertainment manager will contact you.
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSuccess(dj.id)}
                      className="w-full btn-gold py-2.5 text-xs justify-center rounded-xl"
                    >
                      Check Availability & Book DJ <MessageSquare size={13} />
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
