"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { ClipboardCheck, Sparkles, MapPin, Users, IndianRupee } from "lucide-react";

const CITIES = ["Bhopal", "Indore", "Jaipur", "Delhi", "Mumbai"];

export default function DetailsPage() {
  const router = useRouter();
  const onboarding = useStore((s) => s.onboarding);
  const setOnboardingField = useStore((s) => s.setOnboardingField);

  const [location, setLocation] = useState(onboarding.location || "Bhopal");
  const [budget, setBudget] = useState(onboarding.budget || 500000);
  const [guests, setGuests] = useState(onboarding.guests || 150);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setOnboardingField("location", location);
    setOnboardingField("budget", budget);
    setOnboardingField("guests", guests);

    // Filter query params construction
    const params = new URLSearchParams({
      city: location,
      budget: budget.toString(),
      guests: guests.toString()
    });

    // Send verified client with parameters straight to list filtered views
    router.push(`/venues?${params.toString()}`);
  };

  return (
    <div className="space-y-6 font-body">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto border border-gold/20">
          <ClipboardCheck size={18} />
        </div>
        <h1 className="text-xl font-heading font-semibold text-white">Your Wedding Details</h1>
        <p className="text-xs text-zinc-400">Tell us what you are searching for to customize recommendations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* City/Location */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1.5">
            <MapPin size={11} className="text-gold" /> Preferred Celebration City
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none bg-zinc-900 cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Guest Count */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1.5">
            <Users size={11} className="text-gold" /> Expected Guest Count
          </label>
          <input
            type="number"
            min={10}
            max={5000}
            required
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            placeholder="e.g. 250"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold/50"
          />
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1.5">
              <IndianRupee size={11} className="text-gold" /> Total Target Budget
            </label>
            <span className="text-xs text-gold font-semibold">₹{budget.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={50000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-zinc-500 font-semibold uppercase">
            <span>₹1 Lakh</span>
            <span>₹50 Lakhs</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full btn-gold justify-center py-2.5 rounded-lg text-black mt-2"
        >
          Match Venues & Services <Sparkles size={13} />
        </button>

      </form>
    </div>
  );
}
