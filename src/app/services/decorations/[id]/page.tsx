"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, use } from "react";
import {
  MapPin, Check, MessageSquare, ArrowLeft, Star, Sparkles, Palette,
  CheckCircle, ShieldCheck, Phone, Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { vendorApi } from "@/lib/authApi";
import { useQuery } from "@tanstack/react-query";
import GatedBookingModal from "@/components/GatedBookingModal";
import { getImageUrl } from "@/lib/api";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80";

const STYLE_LABELS: Record<string, string> = {
  royal: "Royal",
  floral: "Floral",
  minimal: "Minimal Luxury",
  bollywood: "Bollywood",
  traditional: "Traditional",
  modern: "Modern Premium",
  cultural: "Cultural",
  outdoor: "Outdoor Garden",
};

const TIER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low:     { label: "Budget",   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  medium:  { label: "Standard", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  average: { label: "Premium",  color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  high:    { label: "Luxury",   color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
};

const MOCK_DECORATORS = [
  {
    id: 101,
    name: "Vedic Mandaps",
    type: "Traditional Floral Setups",
    price: "80000",
    rating: "4.8",
    total_reviews: 112,
    specialties: ["Fairy Light Walkway", "Marigold Floral Mandap", "Haldi Jhoola Canopy"],
    image: FALLBACK_IMAGE,
    city: "Bhopal",
    state: "Madhya Pradesh",
    description: "Traditional floral mandaps, marigold walkways, and warm lighting for intimate and grand weddings.",
    themes_count: 1,
    packages: [
      {
        id: 301,
        name: "Marigold Mandap Classic",
        style: "traditional",
        description: "Hand-tied marigold mandap with fairy lights and entrance arch.",
        includes: ["Floral mandap", "Welcome gate", "Pathway lighting"],
        tiers: [
          { tier: "low", price: 80000, description: "Mandap and entrance only" },
          { tier: "medium", price: 140000, description: "Mandap, stage backdrop, 10 centrepieces" },
        ],
      },
    ],
  },
];

function minPackagePrice(packages: any[]): number | null {
  let minPrice = Infinity;
  (packages || []).forEach((pkg: any) => {
    (pkg.tiers || []).forEach((tier: any) => {
      const price = parseFloat(tier.price);
      if (price > 0 && price < minPrice) minPrice = price;
    });
  });
  return minPrice === Infinity ? null : Math.floor(minPrice);
}

export default function DecoratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const decoratorId = Number(unwrappedParams.id);

  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"packages" | "about">("packages");

  const { data: dbVendors, isLoading } = useQuery({
    queryKey: ["approvedDecorators"],
    queryFn: () => vendorApi.listApprovedVendors("decorator"),
  });

  const decorator = (dbVendors && dbVendors.length > 0)
    ? dbVendors.map((v) => {
        const packages = v.decoration_packages || [];
        const styles = [...new Set(packages.map((pkg: any) => STYLE_LABELS[pkg.style] || pkg.style).filter(Boolean))];
        const inclusions = packages.flatMap((pkg: any) => pkg.includes || []).slice(0, 6);
        const price = minPackagePrice(packages);
        return {
          id: v.id,
          name: v.business_name || packages[0]?.name || v.name,
          type: styles.join(" & ") || v.vendor_type || "Decoration Specialist",
          price: price != null ? String(price) : "75000",
          rating: "4.8",
          total_reviews: 89,
          specialties: inclusions.length > 0 ? inclusions : styles,
          image: getImageUrl(v.cover_image || packages[0]?.image || v.logo) || FALLBACK_IMAGE,
          city: v.city,
          state: v.state || "Madhya Pradesh",
          description: v.description || packages[0]?.description || "Premium wedding decoration services.",
          packages,
          themes_count: packages.length,
        };
      }).find((d) => d.id === decoratorId)
    : MOCK_DECORATORS.find((d) => d.id === decoratorId);

  const activeDecorator = decorator || MOCK_DECORATORS[0];

  const handleBookClick = (pkgId?: number) => {
    if (pkgId) setSelectedPackageId(pkgId);
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />

      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-black">
        <Image
          src={activeDecorator.image}
          alt={activeDecorator.name}
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

        <div className="absolute top-20 left-4 sm:left-8">
          <Link href="/services/decorations" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg transition-all hover:bg-white/20">
            <ArrowLeft size={13} /> Back to Decorators
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {activeDecorator.type}
                  </span>
                  {activeDecorator.city && (
                    <span className="bg-white/10 text-white/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin size={9} /> {activeDecorator.city}, {activeDecorator.state}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-white leading-tight">
                  {activeDecorator.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <strong className="text-white">{activeDecorator.rating}</strong>
                    ({activeDecorator.total_reviews} reviews)
                  </span>
                  <span className="w-px h-3 bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Palette size={11} className="text-white/50" /> {activeDecorator.themes_count || activeDecorator.packages?.length || 0} themes
                  </span>
                  <span className="w-px h-3 bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-white/50" /> {activeDecorator.packages?.reduce((n: number, p: any) => n + (p.tiers?.length || 0), 0) || 0} packages
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Starting from</p>
                <p className="text-3xl font-bold text-gold">₹{Number(activeDecorator.price).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="bg-[#f5f3ef] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-2 shadow-sm border border-gray-100">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold self-center mr-1">Styles:</span>
                  {activeDecorator.specialties.map((s: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                      <Check size={10} className="text-emerald-500 shrink-0" /> {s}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                  <button
                    onClick={() => setActiveTab("packages")}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${activeTab === "packages" ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    🎨 Decoration Packages
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${activeTab === "about" ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    ℹ️ About Decorator
                  </button>
                </div>

                {activeTab === "packages" && (
                  <div className="space-y-4">
                    {activeDecorator.packages && activeDecorator.packages.length > 0 ? (
                      activeDecorator.packages.map((pkg: any) => (
                        <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                          <div className="p-4 sm:p-5 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-heading font-bold text-base text-gray-900">{pkg.name}</h3>
                                  {pkg.style && (
                                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-800">
                                      {STYLE_LABELS[pkg.style] || pkg.style}
                                    </span>
                                  )}
                                </div>
                                {pkg.description && (
                                  <p className="text-[11px] text-gray-500">{pkg.description}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {pkg.includes?.length > 0 && (
                            <div className="px-4 sm:px-5 pt-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Package includes</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {pkg.includes.map((item: string, ii: number) => (
                                  <div key={ii} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                                    <span className="text-[11px] font-semibold text-gray-700 truncate">{item}</span>
                                    <Check size={10} className="text-emerald-500 shrink-0 ml-1" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {pkg.tiers?.length > 0 && (
                            <div className="p-4 sm:p-5 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Packages</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {/*
                                  Packages are free-form now: `name` is the identity and `tier`
                                  is an optional label, so key by id — several packages can
                                  legitimately share an empty tier.
                                */}
                                {pkg.tiers.map((tier: any, ti: number) => {
                                  const meta = tier.tier ? TIER_LABELS[tier.tier] : null;
                                  return (
                                    <div
                                      key={tier.id ?? ti}
                                      className={`rounded-xl border p-3 ${meta?.bg || "bg-gray-50 border-gray-100"}`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <span className="block text-xs font-bold text-gray-900 truncate">
                                            {tier.name || meta?.label || "Package"}
                                          </span>
                                          {meta && (
                                            <span className={`text-[9px] font-bold uppercase ${meta.color}`}>
                                              {meta.label}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 shrink-0">
                                          ₹{Number(tier.price).toLocaleString("en-IN")}
                                        </span>
                                      </div>

                                      {(tier.min_guests || tier.max_guests) && (
                                        <p className="text-[10px] text-gray-500 mt-1">
                                          {tier.min_guests && tier.max_guests
                                            ? `${tier.min_guests}–${tier.max_guests} guests`
                                            : tier.max_guests
                                              ? `Up to ${tier.max_guests} guests`
                                              : `From ${tier.min_guests} guests`}
                                        </p>
                                      )}

                                      {tier.description && (
                                        <p className="text-[11px] text-gray-600 mt-1">{tier.description}</p>
                                      )}

                                      {tier.inclusions?.length > 0 && (
                                        <ul className="mt-1.5 space-y-0.5">
                                          {tier.inclusions.slice(0, 4).map((inc: string, i: number) => (
                                            <li key={i} className="text-[10px] text-gray-600 flex items-center gap-1">
                                              <Check size={9} className="text-emerald-500 shrink-0" /> {inc}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {pkg.add_ons?.length > 0 && (
                            <div className="px-4 sm:px-5 pb-1 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Optional add-ons</p>
                              <div className="flex flex-wrap gap-2">
                                {pkg.add_ons.map((a: any, ai: number) => (
                                  <span key={a.id ?? ai} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-[11px] font-semibold text-gold">
                                    {a.name}
                                    <span className="text-gray-600">₹{Number(a.price).toLocaleString("en-IN")}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                            <button
                              onClick={() => handleBookClick(pkg.id)}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
                            >
                              <MessageSquare size={12} /> Request This Package
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                        <p className="text-xs text-gray-400 italic">No packages listed by this decorator yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "about" && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{activeDecorator.description}</p>
                    </div>
                    {/* Design details + policies, pulled from each theme */}
                    {(activeDecorator.packages || []).map((theme: any, ti: number) => {
                      const chips: [string, string[]][] = [
                        ["Colour theme", theme.colour_theme || []],
                        ["Flowers", theme.flowers || []],
                        ["Materials", theme.materials || []],
                        ["Drapery", theme.drapery || []],
                        ["Lighting", theme.lighting || []],
                      ];
                      const hasDetail =
                        chips.some(([, v]) => v.length > 0) ||
                        theme.backdrop_design || theme.advance_percent || theme.setup_time_hours ||
                        theme.travel_policy || theme.cancellation_policy;
                      if (!hasDetail) return null;
                      return (
                        <div key={theme.id ?? ti} className="pt-3 border-t border-gray-100 space-y-2.5">
                          <p className="text-xs font-bold text-gray-900">{theme.name}</p>
                          {chips.filter(([, v]) => v.length > 0).map(([label, values]) => (
                            <div key={label} className="flex flex-wrap items-baseline gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}:</span>
                              {values.map((v) => (
                                <span key={v} className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-700">{v}</span>
                              ))}
                            </div>
                          ))}
                          {theme.backdrop_design && (
                            <p className="text-[11px] text-gray-600">
                              <span className="font-semibold text-gray-700">Backdrop:</span> {theme.backdrop_design}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                            {theme.advance_percent != null && <span>Advance: {theme.advance_percent}%</span>}
                            {theme.setup_time_hours != null && <span>Setup: {theme.setup_time_hours} hrs</span>}
                            {theme.travel_policy && (
                              <span>
                                Travel: {theme.travel_policy === "included" ? "Included"
                                  : theme.travel_policy === "extra" ? "Charged extra" : "Depends on location"}
                              </span>
                            )}
                          </div>
                          {theme.cancellation_policy && (
                            <p className="text-[10px] text-gray-500">
                              <span className="font-semibold">Cancellation:</span> {theme.cancellation_policy}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                      {[
                        { icon: <ShieldCheck size={16} className="text-emerald-500" />, label: "Verified", val: "Platform Verified" },
                        { icon: <Palette size={16} className="text-amber-500" />, label: "Packages", val: `${activeDecorator.packages?.length || 0}` },
                        { icon: <MapPin size={16} className="text-blue-500" />, label: "Location", val: activeDecorator.city },
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

              <div>
                <div className="sticky top-22 space-y-3">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div>
                      <h3 className="font-heading font-semibold text-gray-900 text-base">Request Callback</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Our team will confirm theme, area, and pricing.</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Starting Price</p>
                      <p className="text-2xl font-bold text-gold mt-0.5">₹{Number(activeDecorator.price).toLocaleString("en-IN")}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Choose Package</label>
                      <select
                        value={selectedPackageId || ""}
                        onChange={(e) => setSelectedPackageId(Number(e.target.value) || null)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white text-gray-900 focus:outline-none focus:border-gold cursor-pointer"
                      >
                        <option value="">General Inquiry</option>
                        {activeDecorator.packages?.map((pkg: any) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {success ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl text-center font-bold flex items-center justify-center gap-1.5">
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

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                    {[
                      { icon: <ShieldCheck size={13} className="text-emerald-500" />, text: "100% Verified Decorator" },
                      { icon: <Check size={13} className="text-gold" />, text: "Transparent package pricing" },
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

      {activeDecorator && (
        <GatedBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setSuccess(true)}
          vendorName={activeDecorator.name}
          serviceType="decorator"
          decorationPackageId={selectedPackageId}
        />
      )}
    </>
  );
}
