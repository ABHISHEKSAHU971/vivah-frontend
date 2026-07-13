"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Check, AlertTriangle, Music, Mic, Clock, 
  Sparkles, Star, Play, ChevronRight, CheckCircle2 
} from "lucide-react";
import { api } from "@/lib/api";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";

// Fallback Mock Packages matching the verified DJ customizer spec
const MOCK_PACKAGES = [
  {
    id: 201,
    name: "Royal Celebration Package",
    price: "75000.00",
    hours: 6,
    description: "Premium DJ & traditional live fusion for grand weddings.",
    theme: "royal",
    tier: "Royal Premium",
    occasion_types: ["barat", "sangeet", "wedding"],
    equipment: [
      { id: 301, item_name: "Line Array Bass System", quantity: 2, quantity_available: 6, unit_price: null, is_included: true },
      { id: 302, item_name: "Cordless Vocal Mics", quantity: 2, quantity_available: 4, unit_price: null, is_included: true },
      { id: 303, item_name: "Dry Ice Fog Machine", quantity: 0, quantity_available: 2, unit_price: "3000.00", is_included: false },
      { id: 304, item_name: "Cold Fire Sparklers (4 columns)", quantity: 0, quantity_available: 4, unit_price: "4000.00", is_included: false },
      { id: 305, item_name: "Extra Laser Light Rig (4 sharpies)", quantity: 0, quantity_available: 4, unit_price: "5000.00", is_included: false },
      { id: 306, item_name: "Add-on Speaker Tower Set (2 Bass)", quantity: 0, quantity_available: 4, unit_price: "6000.00", is_included: false },
      { id: 307, item_name: "Live Hype Anchor / Emcee", quantity: 0, quantity_available: 2, unit_price: "8000.00", is_included: false }
    ]
  },
  {
    id: 202,
    name: "Bollywood Filmy Beats",
    price: "50000.00",
    hours: 5,
    description: "Vibrant laser shows, heavy subwoofers, and customized Bollywood soundtrack list.",
    theme: "bollywood",
    tier: "Medium/High Vibe",
    occasion_types: ["sangeet", "reception"],
    equipment: [
      { id: 301, item_name: "Standard Speaker Array", quantity: 2, quantity_available: 4, unit_price: null, is_included: true },
      { id: 302, item_name: "Cordless Vocal Mics", quantity: 2, quantity_available: 4, unit_price: null, is_included: true },
      { id: 303, item_name: "Dry Ice Fog Machine", quantity: 0, quantity_available: 2, unit_price: "3000.00", is_included: false },
      { id: 304, item_name: "Cold Fire Sparklers (4 columns)", quantity: 0, quantity_available: 4, unit_price: "4000.00", is_included: false },
      { id: 305, item_name: "Extra Laser Light Rig (4 sharpies)", quantity: 0, quantity_available: 4, unit_price: "5000.00", is_included: false }
    ]
  },
  {
    id: 203,
    name: "Traditional Folk & Sufi Night",
    price: "40000.00",
    hours: 4,
    description: "Melodious folk rhythms and warm lighting tailored for close family setups.",
    theme: "traditional",
    tier: "Medium Vibe",
    occasion_types: ["haldi", "mehndi"],
    equipment: [
      { id: 301, item_name: "Acoustically Balanced Speakers", quantity: 2, quantity_available: 2, unit_price: null, is_included: true },
      { id: 302, item_name: "Cordless Vocal Mics", quantity: 2, quantity_available: 2, unit_price: null, is_included: true },
      { id: 307, item_name: "Live Hype Anchor / Emcee", quantity: 0, quantity_available: 2, unit_price: "8000.00", is_included: false }
    ]
  },
  {
    id: 204,
    name: "Modern Club & Trance Setup",
    price: "90000.00",
    hours: 7,
    description: "Heavy bass line arrays, strobes, and full night coverage for club sound design.",
    theme: "modern",
    tier: "High-End Vibe",
    occasion_types: ["sangeet", "reception"],
    equipment: [
      { id: 301, item_name: "Dual JBL Professional Line Array", quantity: 2, quantity_available: 6, unit_price: null, is_included: true },
      { id: 302, item_name: "Cordless Vocal Mics", quantity: 4, quantity_available: 6, unit_price: null, is_included: true },
      { id: 303, item_name: "Dry Ice Fog Machine", quantity: 0, quantity_available: 2, unit_price: "3000.00", is_included: false },
      { id: 305, item_name: "Extra Laser Light Rig (4 sharpies)", quantity: 0, quantity_available: 4, unit_price: "5000.00", is_included: false },
      { id: 306, item_name: "Add-on Speaker Tower Set (2 Bass)", quantity: 0, quantity_available: 4, unit_price: "6000.00", is_included: false }
    ]
  }
];

const THEME_DETAILS: Record<string, { title: string; desc: string; img: string; caption: string; tier: string }> = {
  royal: {
    title: "Royal Celebration Package",
    desc: "Grand entry & high-energy Sangeet.",
    img: "/royal_barat_entry.png",
    caption: "Featuring grand horse entry setups, wedding dhol, and custom royal lighting aesthetics.",
    tier: "Tier: Royal Premium"
  },
  bollywood: {
    title: "Bollywood Filmy Beats",
    desc: "Full filmy dance music with retro and modern sets.",
    img: "/wedding_dj_stage.png",
    caption: "Vibrant laser shows, heavy subwoofers, and customized Bollywood soundtrack list.",
    tier: "Tier: Medium/High Vibe"
  },
  traditional: {
    title: "Traditional Folk & Sufi Night",
    desc: "Melodious folk rhythms and warm lighting.",
    img: "/royal_barat_entry.png",
    caption: "Warm golden lights, acoustically balanced setup, ideal for intimate gatherings and mehndi.",
    tier: "Tier: Medium Vibe"
  },
  modern: {
    title: "Modern Club & Trance Setup",
    desc: "EDM, hip-hop, lasers and heavy bass rigs.",
    img: "/wedding_dj_stage.png",
    caption: "Strobe lighting, heavy-duty line arrays, and club sound design built for long dance nights.",
    tier: "Tier: High-End Vibe"
  }
};

const REVIEWS = [
  { name: "Priya Sahu", badge: "Occasion: Royal Barat", rating: 5, story: "The royal entry was magic! When the groom entered with the dhol and the fog dropped right on queue, it felt like a movie scene." },
  { name: "Rahul Sharma", badge: "Occasion: Sangeet", rating: 5, story: "Amit DJ set the stage on fire! We customized our light setup to get extra sharpies and it looked massive. Sound coverage was perfect." }
];

const PLAYLISTS = [
  { name: "Grand Barat Entry Mix", tracks: 4, mins: 15, updated: "2 days ago" },
  { name: "Bollywood Sangeet Hits", tracks: 12, mins: 45, updated: "1 week ago" },
  { name: "Haldi Folk & Fusion", tracks: 8, mins: 30, updated: "3 days ago" }
];

export default function DjCustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id ? Number(params.id) : null;

  // Tabs and slider state
  const [activeTab, setActiveTab] = useState<"reviews" | "playlists">("reviews");
  const [selectedTheme, setSelectedTheme] = useState<string>("royal");
  const [guestCount, setGuestCount] = useState<number>(250);

  // Selections state (track equipment item ID -> quantity)
  const [selections, setSelections] = useState<Record<number, number>>({});
  
  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch vendor profile details for DJ
  const { data: dbVendors } = useQuery({
    queryKey: ["approvedDjs"],
    queryFn: () => vendorApi.listApprovedVendors("dj"),
  });

  const djVendor = dbVendors?.find((v: any) => v.id === vendorId);

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:8000${cleanUrl}`;
  };

  // 1. Fetch live DJ packages for this vendor
  const { data: dbPackages, isLoading } = useQuery({
    queryKey: ["djPackages", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const res = await api.get(`/dj/packages/?vendor=${vendorId}`);
      return res.data.data;
    },
    enabled: !!vendorId
  });

  const packagesList = (dbPackages && dbPackages.length > 0) ? dbPackages : MOCK_PACKAGES;
  const activePackage = packagesList.find((p: any) => p.theme === selectedTheme) || packagesList[0];

  // Sync selections when package changes (reset checkbox selections)
  useEffect(() => {
    setSelections({});
  }, [activePackage?.id]);

  // 2. Fetch live pricing quotes from backend
  const { data: quoteResponse } = useQuery({
    queryKey: ["djQuote", activePackage?.id, selections],
    queryFn: async () => {
      if (!activePackage?.id) return null;
      const selectionList = Object.entries(selections).map(([id, qty]) => ({
        equipment_item_id: Number(id),
        quantity: qty
      }));
      const res = await api.post("/dj/equipment/quote/", {
        package_id: activePackage.id,
        selections: selectionList
      });
      return res.data.data;
    },
    enabled: !!activePackage?.id
  });

  // Calculate pricing breakdown with fallbacks
  const basePrice = Number(activePackage?.price || 50000);
  const weekendSurcharge = basePrice * 0.1;
  const customExtrasTotal = quoteResponse?.equipment_addon ?? Object.entries(selections).reduce((total, [id, qty]) => {
    const item = activePackage?.equipment?.find((e: any) => e.id === Number(id));
    if (item && !item.is_included) {
      return total + (Number(item.unit_price) * qty);
    }
    return total;
  }, 0);

  const totalPrice = basePrice + weekendSurcharge + customExtrasTotal;

  // Toggle checklist selections
  const handleCheckboxChange = (eqId: number, checked: boolean) => {
    setSelections(prev => {
      const updated = { ...prev };
      if (checked) {
        updated[eqId] = 1;
      } else {
        delete updated[eqId];
      }
      return updated;
    });
  };

  // Compile customization details text for inquiry message
  const getCustomizationDetails = () => {
    const lines = [];
    lines.push(`Selected Theme: ${selectedTheme.toUpperCase()}`);
    lines.push(`Base Package: ${activePackage?.name} (₹${basePrice})`);
    
    const extraItems = Object.entries(selections).map(([id]) => {
      const item = activePackage?.equipment?.find((e: any) => e.id === Number(id));
      return item ? `${item.item_name} (+₹${Number(item.unit_price).toLocaleString('en-IN')})` : null;
    }).filter(Boolean);

    if (extraItems.length > 0) {
      lines.push(`Add-ons: ${extraItems.join(", ")}`);
    } else {
      lines.push("Add-ons: None");
    }
    lines.push(`Final Estimated Price: ₹${totalPrice.toLocaleString('en-IN')}`);
    return lines.join(" | ");
  };

  const themeData = THEME_DETAILS[selectedTheme] || THEME_DETAILS.royal;

  return (
    <div className="flex flex-col min-h-screen bg-[#050D1A] text-slate-100 font-sans selection:bg-[#C9A440]/30 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button 
            onClick={() => router.push("/services/dj-sound")}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#C9A440] transition-colors font-medium text-sm mb-8"
          >
            <ArrowLeft size={16} /> Back to listings
          </button>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A440]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* LEFT PANE: SHOWCASE (7 Columns) */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Theme Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(["royal", "bollywood", "traditional", "modern"] as const).map((key) => {
                    const card = THEME_DETAILS[key];
                    const icons: Record<string, string> = { royal: "🐴", bollywood: "🎬", traditional: "🪕", modern: "⚡" };
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTheme(key)}
                        className={`text-left p-4 rounded-xl border transition-all duration-300 ${
                          selectedTheme === key 
                            ? "bg-[#C9A440]/15 border-[#C9A440] shadow-[0_0_15px_rgba(201,164,64,0.15)]" 
                            : "bg-[#0F1E35]/40 border-[#C9A440]/20 hover:border-[#C9A440]/60"
                        }`}
                      >
                        <div className="text-2xl mb-2">{icons[key]}</div>
                        <div className="font-semibold text-xs text-white uppercase tracking-wider">{key} Theme</div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{card.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Showcase Media Card */}
                <div className="bg-[#0F1E35]/30 border border-[#C9A440]/15 rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="relative h-96 w-full bg-slate-950">
                    <img
                      src={getImageUrl(activePackage?.listing_image) || getImageUrl(djVendor?.logo) || themeData.img}
                      alt={themeData.title}
                      className="object-cover opacity-85 w-full h-full transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A] via-transparent to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                      <h3 className="font-heading font-semibold text-2xl text-[#C9A440]">
                        {themeData.title}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {themeData.caption}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Tabs (Reviews & Playlists) */}
                <div className="bg-[#0F1E35]/35 border border-[#C9A440]/15 rounded-2xl p-6 shadow-xl">
                  <div className="flex border-b border-[#C9A440]/15 gap-8 mb-6">
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`pb-3 font-heading font-medium text-sm relative transition-colors ${
                        activeTab === "reviews" ? "text-[#C9A440]" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Real Stories (Reviews)
                      {activeTab === "reviews" && (
                        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#C9A440] shadow-[0_0_8px_#C9A440]" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("playlists")}
                      className={`pb-3 font-heading font-medium text-sm relative transition-colors ${
                        activeTab === "playlists" ? "text-[#C9A440]" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Mix Previews
                      {activeTab === "playlists" && (
                        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#C9A440] shadow-[0_0_8px_#C9A440]" />
                      )}
                    </button>
                  </div>

                  {/* Reviews Content */}
                  {activeTab === "reviews" && (
                    <div className="space-y-4">
                      {REVIEWS.map((rev, idx) => (
                        <div key={idx} className="bg-[#0F1E35]/20 border-l-[3px] border-[#C9A440] rounded-r-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-xs text-slate-200">{rev.name}</div>
                              <span className="inline-block bg-[#C9A440]/10 border border-[#C9A440]/30 text-[#C9A440] text-[9px] font-bold px-2 py-0.5 rounded-full mt-1">
                                {rev.badge}
                              </span>
                            </div>
                            <span className="text-xs text-[#C9A440]">{"★".repeat(rev.rating)}</span>
                          </div>
                          <p className="text-xs text-slate-400 italic">"{rev.story}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Playlists Content */}
                  {activeTab === "playlists" && (
                    <div className="space-y-3">
                      {PLAYLISTS.map((play, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#0F1E35]/25 border border-[#C9A440]/10 rounded-xl p-4 hover:bg-[#C9A440]/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <button className="w-8 h-8 rounded-full bg-[#C9A440]/10 border border-[#C9A440]/30 flex items-center justify-center text-[#C9A440] hover:bg-[#C9A440] hover:text-[#050D1A] transition-all">
                              <Play size={12} className="ml-0.5" />
                            </button>
                            <div>
                              <div className="font-semibold text-xs text-slate-200">{play.name}</div>
                              <div className="text-[10px] text-slate-400">{play.tracks} tracks • {play.mins} mins</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-900/40 border border-[#C9A440]/10 px-2 py-1 rounded-full">
                            Updated {play.updated}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT PANE: CONFIGURATOR (5 Columns) */}
              <div className="lg:col-span-5 bg-[#0A1628]/85 border border-[#C9A440]/25 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-6 lg:sticky lg:top-28">
                
                {/* Title and Tier */}
                <div className="space-y-2">
                  {djVendor && (
                    <div className="text-[#C9A440] text-xs font-semibold uppercase tracking-widest font-heading">
                      Presented by {djVendor.business_name}
                    </div>
                  )}
                  <span className="inline-block bg-[#C9A440]/10 border border-[#C9A440]/35 text-[#C9A440] text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                    Tier: {activePackage?.tier || "Standard Vibe"}
                  </span>
                  <h2 className="font-heading font-semibold text-2xl text-white">
                    {activePackage?.name || "Music Setup Combo"}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activePackage?.description}
                  </p>
                </div>

                {/* Included Loadouts */}
                <div className="bg-[#0F1E35]/40 border border-[#C9A440]/15 rounded-xl p-5 space-y-3">
                  <h4 className="font-heading font-semibold text-xs text-[#C9A440] tracking-wider uppercase">
                    Standard Loadout (Included)
                  </h4>
                  <div className="space-y-2">
                    {activePackage?.equipment?.filter((e: any) => e.is_included).map((eq: any) => (
                      <div key={eq.id} className="flex items-center gap-2.5 text-xs">
                        <span className="text-[#C9A440]">✔</span>
                        <span className="text-slate-300">
                          {eq.quantity}x {eq.item_name}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="text-[#C9A440]">⏱</span>
                      <span>{activePackage?.hours}-Hour Active Performance Coverage</span>
                    </div>
                  </div>
                </div>

                {/* Guest Count Slider */}
                <div className="bg-[#0F1E35]/40 border border-[#C9A440]/15 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">Expected Guests:</span>
                    <span className="text-[#C9A440] text-sm font-bold">{guestCount} Guests</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={600}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 border border-[#C9A440]/10 rounded-lg appearance-none cursor-pointer accent-[#C9A440]"
                  />
                  {guestCount > 300 && (
                    <div className="bg-[#C9A440]/10 border border-[#C9A440]/30 rounded-lg p-3 text-[10px] text-[#D4B96A] flex items-start gap-2 animate-fade-in">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        <strong>Sound Scale Recommendation:</strong> Your event count exceeds standard audio limits. Consider checking the <strong>Speaker Upgrade Add-on</strong> below.
                      </span>
                    </div>
                  )}
                </div>

                {/* Customizable Add-on Extras */}
                <div className="space-y-3">
                  <h4 className="font-heading font-semibold text-sm text-slate-200">
                    Customize Setup Extras
                  </h4>
                  <div className="space-y-2.5">
                    {activePackage?.equipment?.filter((e: any) => !e.is_included).map((eq: any) => {
                      const isChecked = !!selections[eq.id];
                      const isRecommendSpeaker = guestCount > 300 && eq.item_name.toLowerCase().includes("speaker");

                      return (
                        <div
                          key={eq.id}
                          className={`flex items-center justify-between p-3.5 border rounded-xl transition-all duration-300 ${
                            isChecked 
                              ? "bg-[#C9A440]/10 border-[#C9A440]" 
                              : isRecommendSpeaker 
                              ? "border-amber-500/50 bg-[#0F1E35]/20 animate-pulse"
                              : "bg-[#0F1E35]/30 border-[#C9A440]/15 hover:border-[#C9A440]/45"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer select-none grow">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(eq.id, e.target.checked)}
                              className="w-4.5 h-4.5 rounded border-[#C9A440]/40 text-[#C9A440] focus:ring-[#C9A440] bg-slate-900 cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-semibold text-white">{eq.item_name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Quantity: 1 • Limit: {eq.quantity_available} available</div>
                            </div>
                          </label>
                          <span className="text-xs font-bold text-[#C9A440] shrink-0 ml-2">
                            +₹{Number(eq.unit_price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Invoice Invoice Breakdowns */}
                <div className="border-t border-[#C9A440]/20 pt-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Base Package Rate:</span>
                    <span>₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  {customExtrasTotal > 0 && (
                    <div className="flex justify-between text-xs text-slate-400 animate-fade-in">
                      <span>Custom Extras Surcharge:</span>
                      <span>+₹{customExtrasTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Weekend & Logistics Fee (10%):</span>
                    <span>+₹{weekendSurcharge.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center text-white font-bold border-t border-[#C9A440]/10 pt-3 mt-2">
                    <span className="text-sm">Final Estimated Total:</span>
                    <span className="text-xl text-[#C9A440] text-shadow-[0_0_10px_rgba(201,164,64,0.2)]">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 border border-[#C9A440]/15 bg-slate-900/40 p-2.5 rounded-lg text-center mt-2.5">
                    💡 Bundle discount: 10% automatically deducted if reserved within a Venue slot.
                  </p>
                </div>

                {/* Submit Booking Trigger */}
                {success ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 rounded-xl p-4 text-center text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Inquiry successfully queued! Check your dashboard.
                  </div>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 text-center rounded-xl bg-[#C9A440] border border-[#D4B96A] text-[#050D1A] font-bold text-sm hover:bg-[#D4B96A] active:translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(201,164,64,0.25)] hover:shadow-[0_6px_25px_rgba(201,164,64,0.4)] cursor-pointer"
                  >
                    Check Availability & Book Custom Setup
                  </button>
                )}

              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />

      {isModalOpen && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(true)}
          vendorName={djVendor?.business_name || activePackage?.name || "DJ Partner"}
          serviceType="dj"
          customizationDetails={getCustomizationDetails()}
        />
      )}
    </div>
  );
}
