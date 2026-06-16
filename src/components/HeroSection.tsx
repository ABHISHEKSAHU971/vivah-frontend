"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, Search, ChevronDown } from "lucide-react";

const GUEST_CAPACITIES = [
  "100-300 guests",
  "300-600 guests",
  "600-1000 guests",
  "1000+ guests",
];

const CITIES = [
  "Bhopal", "Indore", "Jaipur", "Delhi", "Mumbai",
  "Hyderabad", "Ahmedabad", "Lucknow", "Chandigarh", "Pune",
];

export default function HeroSection() {
  const router = useRouter();
  const [city, setCity] = useState("Bhopal");
  const [guests, setGuests] = useState("300-600 guests");

  const handleSearch = () => {
    const params = new URLSearchParams({ city, guests });
    router.push(`/venues?${params.toString()}`);
  };

  return (
    <section
      className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-center items-center overflow-hidden py-20 md:py-28"
      style={{ background: "var(--navy)" }}
    >
      {/* Background image with dynamic Ken Burns zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-kenburns"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80')",
        }}
      />
      
      {/* Dark gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,13,26,0.7) 0%, rgba(5,13,26,0.4) 50%, rgba(5,13,26,0.85) 100%)",
        }}
      />
      {/* Radial vignette for central contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(5,13,26,0.2) 0%, rgba(5,13,26,0.7) 100%)",
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center space-y-8 md:space-y-10">
        
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3">
          <div
            className="h-px w-8"
            style={{ background: "var(--gold)" }}
          />
          <span className="eyebrow text-xs tracking-widest">AI-Powered Wedding Planning</span>
          <div
            className="h-px w-8"
            style={{ background: "var(--gold)" }}
          />
        </div>

        {/* Main Headline */}
        <h1
          className="font-heading text-white leading-tight drop-shadow-md"
          style={{
            fontSize: "clamp(2.2rem, 5.5vw, 4.8rem)",
            maxWidth: "850px",
          }}
        >
          Every shaadi,{" "}
          <em style={{ color: "var(--gold)", fontStyle: "italic" }}>perfectly</em>{" "}
          planned.
        </h1>

        {/* Subheading */}
        <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl drop-shadow">
          Discover physically audited venues and verified services across India. Compare packages, check availability, and plan stress-free with our AI Concierge.
        </p>

        {/* Capsule Search Console */}
        <div
          className="flex flex-col md:flex-row gap-4 md:gap-0 rounded-2xl md:rounded-full overflow-hidden w-full max-w-4xl p-3 md:p-2 border"
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(201, 164, 64, 0.25)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          }}
        >
          {/* Location Selector */}
          <div className="flex-1 flex items-center px-4 py-2 hover:bg-black/[0.02] transition-colors rounded-xl md:rounded-full">
            <MapPin
              size={18}
              className="text-gold shrink-0 mr-3 pointer-events-none"
            />
            <div className="flex flex-col items-start w-full">
              <span className="text-[9px] font-bold text-gold tracking-widest uppercase mb-0.5">Location</span>
              <div className="relative w-full">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent border-0 outline-none appearance-none cursor-pointer pr-6 py-0.5 text-gray-900"
                  aria-label="Select city"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-px hidden md:block self-stretch my-2 bg-gray-200"
          />

          {/* Guest Capacity Selector */}
          <div className="flex-1 flex items-center px-4 py-2 hover:bg-black/[0.02] transition-colors rounded-xl md:rounded-full">
            <Users
              size={18}
              className="text-gold shrink-0 mr-3 pointer-events-none"
            />
            <div className="flex flex-col items-start w-full">
              <span className="text-[9px] font-bold text-gold tracking-widest uppercase mb-0.5">Capacity</span>
              <div className="relative w-full">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent border-0 outline-none appearance-none cursor-pointer pr-6 py-0.5 text-gray-900"
                  aria-label="Select guest capacity"
                >
                  {GUEST_CAPACITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            id="hero-search-btn"
            onClick={handleSearch}
            className="btn-gold justify-center rounded-xl md:rounded-full md:px-8 py-3.5 cursor-pointer shrink-0 w-full md:w-auto"
          >
            <Search size={16} />
            Find Venues
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-4">
          {[
            { num: "500+", label: "Curated Venues" },
            { num: "200+", label: "Verified Vendors" },
            { num: "10k+", label: "Celebrations" },
          ].map((s, idx) => (
            <div key={s.label} className="flex items-center">
              {idx > 0 && (
                <div
                  className="hidden md:block w-[1px] h-8 mr-12 bg-white/20"
                />
              )}
              <div className="text-center md:text-left">
                <div
                  className="font-heading font-bold leading-none text-2xl md:text-3xl"
                  style={{ color: "var(--gold)" }}
                >
                  {s.num}
                </div>
                <div
                  className="text-white/50 text-[9px] font-semibold mt-1 uppercase tracking-widest"
                >
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--white))",
        }}
      />
    </section>
  );
}
