"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, use } from "react";
import { 
  MapPin, Check, MessageSquare, ArrowLeft, Star, Users, CheckCircle, 
  Utensils, ChefHat, Clock, ShieldCheck, Phone
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";
import { getImageUrl } from "@/lib/api";

const MOCK_CATERERS = [
  { 
    id: 101, name: "Annapurna Caterers", type: "Rajasthani & Gujarati & Jain",
    price_per_plate: "350", rating: "4.8", total_reviews: 124, min_guests: 50,
    specialties: ["Rajasthani Specialties", "Gujarati Counters", "Custom Jain Menu"], 
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80", 
    city: "Indore", state: "Madhya Pradesh",
    description: "Pure veg traditional catering services specializing in Rajasthani, Gujarati & Jain menus. Serving over 500 weddings with authentic flavors and impeccable presentation.",
    packages: [
      { id: 201, name: "Silver Traditional Buffet", tier: "low", price_per_plate: 450, material_option: "with_material", min_plates: 50, description: "Starters: Soup (1). Main Course: Special Veg (1), Seasonal Veg (2), Dal (1), Rice (1), Breads (3), Desserts (1)." },
      { id: 202, name: "Gold Royal Banquet", tier: "medium", price_per_plate: 650, price_per_plate_without_material: 350, material_option: "both", min_plates: 80, description: "Starters: Live Counters (2), Soup (1). Main Course: Special Veg (2), Seasonal Veg (3), Dal (1), Rice (2), Breads (4), Desserts (2). Special Additions: Welcome Drinks (1)." }
    ]
  },
  { 
    id: 102, name: "Royal Kitchens", type: "Multi-Cuisine & Continental & South Indian",
    price_per_plate: "600", rating: "4.9", total_reviews: 98, min_guests: 100,
    specialties: ["Multi-Cuisine Fusion", "Continental Delicacies", "South Indian Counters"], 
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80", 
    city: "Bhopal", state: "Madhya Pradesh",
    description: "Premium catering partner offering multi-cuisine menus, live stations, and luxury presentation. Renowned for grand receptions with bespoke menu curation.",
    packages: [
      { id: 203, name: "Reception Dinner Platinum", tier: "high", price_per_plate: 1200, price_per_plate_without_material: 600, material_option: "both", min_plates: 100, description: "Starters: Live Counters (4), Soup (1). Main Course: Salad/Papad/Achar, Special Veg (1), Seasonal Veg (3), Dal (1), Rice (2), Breads (5), Desserts (4). Special Additions: Barat Welcome, Chinese (2), South Indian (2), Continental (2), Ice Cream (3), Kesari Milk/Coffee (1), Shakes (2), Mocktails (2)." }
    ]
  },
];

interface MenuSection { label: string; items: { name: string; count?: number }[] }

function parseDescriptionToSections(description: string): MenuSection[] {
  if (!description) return [];
  const sections: MenuSection[] = [];
  
  // Split into sections by label
  const sectionMatches = description.split(/(Starters:|Main Course:|Special Additions:)/i);
  let currentLabel = "Included Items";
  
  for (let i = 0; i < sectionMatches.length; i++) {
    const part = sectionMatches[i].trim();
    if (!part) continue;
    const lower = part.toLowerCase();
    
    if (lower === "starters:") { currentLabel = "🔥 Starters"; continue; }
    if (lower === "main course:") { currentLabel = "🍽️ Main Course"; continue; }
    if (lower === "special additions:") { currentLabel = "✨ Special Additions"; continue; }
    
    const items: { name: string; count?: number }[] = [];
    const rawItems = part.replace(/\.+$/, "").split(/,\s*/);
    for (const raw of rawItems) {
      const cleaned = raw.trim();
      if (!cleaned) continue;
      const match = cleaned.match(/^([^(]+?)(?:\s*\((\d+)\))?$/);
      if (match) {
        items.push({ name: match[1].trim(), count: match[2] ? parseInt(match[2]) : undefined });
      }
    }
    if (items.length > 0) {
      sections.push({ label: currentLabel, items });
    }
  }
  return sections;
}

const TIER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low:     { label: "Budget",   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  medium:  { label: "Standard", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  average: { label: "Premium",  color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  high:    { label: "Luxury",   color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
};

export default function CatererDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const catererId = Number(unwrappedParams.id);

  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"packages" | "about">("packages");

  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedCaterers"],
    queryFn: () => vendorApi.listApprovedVendors("caterer"),
  });

  const caterer = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => {
        const biz = v.catering_business;
        const packages = biz?.packages || [];
        let minPrice = Infinity;
        packages.forEach((pkg: any) => {
          const pWith = parseFloat(pkg.price_per_plate);
          const pWithout = parseFloat(pkg.price_per_plate_without_material);
          if (pWith > 0 && pWith < minPrice) minPrice = pWith;
          if (pWithout > 0 && pWithout < minPrice) minPrice = pWithout;
        });
        const formattedCuisines = biz?.cuisines?.map((c: string) => {
          if (c === "rajasthani") return "Rajasthani Specialties";
          if (c === "gujarati") return "Gujarati Counters";
          if (c === "jain") return "Custom Jain Menu";
          if (c === "multi") return "Multi-Cuisine Fusion";
          if (c === "continental") return "Continental Delicacies";
          if (c === "south_indian") return "South Indian Counters";
          return c.charAt(0).toUpperCase() + c.slice(1);
        }) || [];
        return {
          id: v.id,
          name: biz?.brand_name || v.business_name,
          type: biz?.cuisines?.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(" & ") || v.vendor_type,
          price_per_plate: minPrice !== Infinity ? String(Math.floor(minPrice)) : "500",
          rating: "4.8",
          total_reviews: 89,
          min_guests: biz?.min_guests || 50,
          specialties: formattedCuisines,
          image: getImageUrl(biz?.logo_url || v.cover_image || v.logo) || "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80",
          city: biz?.city || v.city,
          state: v.state || "Madhya Pradesh",
          description: biz?.description || v.description || "Premium wedding catering services.",
          packages,
        };
      }).find(c => c.id === catererId)
    : MOCK_CATERERS.find(c => c.id === catererId);

  const activeCaterer = caterer || MOCK_CATERERS[0];

  const handleBookClick = (pkgId?: number) => {
    if (pkgId) setSelectedPackageId(pkgId);
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />

      {/* ── Full-width Hero ───────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-black">
        <Image
          src={activeCaterer.image}
          alt={activeCaterer.name}
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        
        {/* Back nav */}
        <div className="absolute top-20 left-4 sm:left-8">
          <Link href="/services/catering" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg transition-all hover:bg-white/20">
            <ArrowLeft size={13} /> Back to Caterers
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {activeCaterer.type}
                  </span>
                  {activeCaterer.city && (
                    <span className="bg-white/10 text-white/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin size={9} /> {activeCaterer.city}, {activeCaterer.state}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-white leading-tight">
                  {activeCaterer.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <strong className="text-white">{activeCaterer.rating}</strong>
                    ({activeCaterer.total_reviews} reviews)
                  </span>
                  <span className="w-px h-3 bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-white/50" /> Min {activeCaterer.min_guests} guests
                  </span>
                  <span className="w-px h-3 bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Utensils size={11} className="text-white/50" /> {activeCaterer.packages?.length || 0} packages
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Starting from</p>
                <p className="text-3xl font-bold text-gold">₹{activeCaterer.price_per_plate}<span className="text-sm font-normal text-white/50">/plate</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="bg-[#f5f3ef] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left: Main Details ─────────────────────── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Specialties strip */}
                <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-2 shadow-sm border border-gray-100">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold self-center mr-1">Cuisines:</span>
                  {activeCaterer.specialties.map((s: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                      <Check size={10} className="text-emerald-500 shrink-0" /> {s}
                    </span>
                  ))}
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                  <button
                    onClick={() => setActiveTab("packages")}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${activeTab === "packages" ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    🍽️ Catering Packages
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${activeTab === "about" ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    ℹ️ About Caterer
                  </button>
                </div>

                {/* ── Packages Tab ── */}
                {activeTab === "packages" && (
                  <div className="space-y-4">
                    {activeCaterer.packages && activeCaterer.packages.length > 0 ? (
                      activeCaterer.packages.map((pkg: any) => {
                        const tier = TIER_LABELS[pkg.tier] || TIER_LABELS.medium;
                        const sections = parseDescriptionToSections(pkg.description);
                        return (
                          <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            {/* Package header */}
                            <div className="p-4 sm:p-5 border-b border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-heading font-bold text-base text-gray-900">{pkg.name}</h3>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color}`}>
                                      {tier.label}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <Users size={10} /> Min {pkg.min_plates || 50} plates
                                  </p>
                                </div>

                                {/* Pricing columns */}
                                <div className="flex gap-4 sm:text-right">
                                  {(pkg.material_option === "with_material" || pkg.material_option === "both") && (
                                    <div>
                                      <p className="text-[9px] text-gray-400 uppercase font-bold">With Material</p>
                                      <p className="text-lg font-bold text-gray-900">₹{Number(pkg.price_per_plate).toLocaleString("en-IN")}<span className="text-[10px] font-normal text-gray-400">/pl</span></p>
                                    </div>
                                  )}
                                  {(pkg.material_option === "without_material" || pkg.material_option === "both") && (
                                    <div>
                                      <p className="text-[9px] text-gray-400 uppercase font-bold">Without Material</p>
                                      <p className="text-lg font-bold text-gold">₹{Number(pkg.price_per_plate_without_material).toLocaleString("en-IN")}<span className="text-[10px] font-normal text-gray-400">/pl</span></p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Menu breakdown */}
                            {sections.length > 0 && (
                              <div className="p-4 sm:p-5 space-y-4">
                                {sections.map((section, si) => (
                                  <div key={si}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{section.label}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                      {section.items.map((item, ii) => (
                                        <div key={ii} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                                          <span className="text-[11px] font-semibold text-gray-700 truncate">{item.name}</span>
                                          {item.count ? (
                                            <span className="text-[10px] font-bold text-gold ml-1 shrink-0">×{item.count}</span>
                                          ) : (
                                            <Check size={10} className="text-emerald-500 shrink-0 ml-1" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Package CTA */}
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                              <button
                                onClick={() => handleBookClick(pkg.id)}
                                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
                              >
                                <MessageSquare size={12} /> Request This Package
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                        <p className="text-xs text-gray-400 italic">No packages listed by this caterer yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── About Tab ── */}
                {activeTab === "about" && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{activeCaterer.description}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      {[
                        { icon: <ShieldCheck size={16} className="text-emerald-500" />, label: "Verified", val: "Platform Verified" },
                        { icon: <Users size={16} className="text-blue-500" />, label: "Min Guests", val: `${activeCaterer.min_guests}+` },
                        { icon: <MapPin size={16} className="text-amber-500" />, label: "Location", val: activeCaterer.city },
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-1">
                          {stat.icon}
                          <p className="text-[9px] text-gray-400 uppercase font-bold">{stat.label}</p>
                          <p className="text-xs font-bold text-gray-800">{stat.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Sticky Booking Card ───────────────── */}
              <div>
                <div className="sticky top-22 space-y-3">
                  {/* Price & CTA card */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div>
                      <h3 className="font-heading font-semibold text-gray-900 text-base">Request Callback</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Our team will confirm menu & pricing.</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Starting Price</p>
                      <p className="text-2xl font-bold text-gold mt-0.5">₹{activeCaterer.price_per_plate}<span className="text-xs font-normal text-gray-400"> /plate</span></p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Choose Package</label>
                      <select
                        value={selectedPackageId || ""}
                        onChange={(e) => setSelectedPackageId(Number(e.target.value) || null)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold cursor-pointer"
                      >
                        <option value="">General Inquiry</option>
                        {activeCaterer.packages?.map((pkg: any) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} (from ₹{pkg.material_option === "without_material" ? pkg.price_per_plate_without_material : pkg.price_per_plate}/plate)
                          </option>
                        ))}
                      </select>
                    </div>

                    {success ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl text-center font-bold flex items-center gap-1.5 justify-center">
                        <CheckCircle size={14} className="text-emerald-600" /> Inquiry Submitted!
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBookClick()}
                        className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gold hover:text-black text-white text-xs font-bold py-3 rounded-xl transition-all duration-200"
                      >
                        <Phone size={13} /> Book & Verify Now
                      </button>
                    )}
                  </div>

                  {/* Trust badges */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                    {[
                      { icon: <ShieldCheck size={13} className="text-emerald-500" />, text: "100% Verified Caterer" },
                      { icon: <Check size={13} className="text-gold" />, text: "Transparent Menu Pricing" },
                      { icon: <Clock size={13} className="text-blue-500" />, text: "Callback within 2 hours" },
                    ].map((badge, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600 font-medium">
                        {badge.icon} {badge.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />

      {activeCaterer && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(true)}
          vendorName={activeCaterer.name}
          serviceType="catering"
          cateringPackageId={selectedPackageId}
        />
      )}
    </>
  );
}
