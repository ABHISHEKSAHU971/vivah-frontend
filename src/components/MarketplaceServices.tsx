"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Utensils, Paintbrush, Music } from "lucide-react";

const SERVICES = [
  {
    title: "Curated Catering",
    description: "From traditional Rajasthani thalis to fusion global cuisines, hire verified caterers with custom menus.",
    tag: "Pure Veg, Jain & Non-Veg",
    link: "/services/catering",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80"
  },
  {
    title: "Signature Decoration",
    description: "Floral mandap designs, fairy-light entries, and customized stage setups designed by local artists.",
    tag: "Stage, Mandap & Haldi Setup",
    link: "/services/decorations",
    icon: Paintbrush,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80"
  },
  {
    title: "DJ & Sound Systems",
    description: "Get professional sound, visual setups, and curated playlists for your Mehendi, Sangeet, and Baraat.",
    tag: "Sound, Lighting & Dhol",
    link: "/services/dj-sound",
    icon: Music,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80"
  }
];

export default function MarketplaceServices() {
  return (
    <section className="py-24" style={{ background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="eyebrow mb-4">Complete Your Shaadi Checklist</p>
          <h2 className="font-heading" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--text-dark)", lineHeight: 1.2 }}>
            Curated services, <br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>personally</em> selected.
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg">
            Complete your planning by matching with pre-vetted specialists in catering, decoration, and DJ entertainment, each fully customisable to your functions.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                
                {/* Image Section with Hover Zoom */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={srv.image}
                    alt={srv.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Tag */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/95 text-gold shadow-sm">
                      <Icon size={14} />
                    </div>
                    <span className="text-white text-xs font-medium tracking-wide">
                      {srv.tag}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div className="space-y-2.5">
                    <h3 className="font-heading font-semibold text-xl" style={{ color: "var(--text-dark)" }}>
                      {srv.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 mt-6 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gold tracking-widest uppercase">Verified Partners</span>
                    <Link href={srv.link} className="flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2 text-gray-900">
                      Explore <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
