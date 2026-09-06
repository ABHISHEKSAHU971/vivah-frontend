"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueGallery, { type VenuePhoto } from "@/components/VenueGallery";
import ServiceSourcePicker, {
  type ServicePolicy, type ServiceOption, type ServiceSource,
} from "@/components/ServiceSourcePicker";
import CateringMenuBuilder from "@/components/CateringMenuBuilder";
import PlanningGateModal from "@/components/PlanningGateModal";
import { use, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AirVent, ArrowLeft, BedDouble, Building2, CalendarDays, CheckCircle2, Car,
  Check, Info, Loader2, Lock, MapPin, PartyPopper, ShieldCheck, Sparkles,
  Star, Users, Waves,
} from "lucide-react";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { todayISO, type DiscoveryBrief } from "@/lib/discovery";
import { VENUE_TYPE_LABELS } from "@/components/VenueCard";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=80";

/** Fallback in-house decor themes when the venue owner lists no packages. */
const INHOUSE_THEMES = [
  { id: "standard", name: "Standard Theme", price: 0, tier: "low" },
  { id: "royal", name: "Premium Royal Theme", price: 25000, tier: "average" },
  { id: "floral", name: "Exotic Floral Theme", price: 40000, tier: "high" },
];

type Tab = "overview" | "spaces" | "policies";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
}

/** Map a venue's `*_policy` field onto the picker's vocabulary. */
function toPolicy(raw: string | undefined): ServicePolicy {
  if (raw === "inhouse" || raw === "external" || raw === "none") return raw;
  return "both";
}

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const venueId = Number(use(params).id);

  const storeToken = useStore((s) => s.token);
  const storeUser = useStore((s) => s.user);
  const storeOnboardingPhone = useStore((s) => s.onboarding.phone);

  // ── Venue ─────────────────────────────────────────────────────────────
  const { data: venue, isLoading } = useQuery({
    queryKey: ["venueDetail", venueId],
    queryFn: async () => {
      const res = await api.get(`/venues/venues/${venueId}/`);
      return res.data?.data ?? res.data;
    },
    retry: false,
  });

  // ── Quote inputs ──────────────────────────────────────────────────────
  const [guests, setGuests] = useState(300);
  const [eventDate, setEventDate] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [gateOpen, setGateOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Null means "no explicit choice yet" — the effective value is then derived
  // from what's actually on offer, so there's nothing to sync in an effect.
  const [cateringSourcePick, setCateringSourcePick] = useState<ServiceSource | null>(null);
  const [decorSourcePick, setDecorSourcePick] = useState<ServiceSource | null>(null);
  const [cateringPkgPick, setCateringPkgPick] = useState("");
  const [decorPkgPick, setDecorPkgPick] = useState("");
  const [decorTier, setDecorTier] = useState("average");
  const [inhouseTheme, setInhouseTheme] = useState("standard");
  const [selectedFoodIds, setSelectedFoodIds] = useState<number[]>([]);

  const signedIn = !!(
    storeToken ||
    readCookie("access_token") ||
    (typeof window !== "undefined" && localStorage.getItem("access_token"))
  );

  const cateringPolicy = toPolicy(venue?.catering_policy);
  const decorPolicy = toPolicy(venue?.decoration_policy);

  // ── Catering & decoration options, split by who provides them ─────────
  // Fetched without a scope and split client-side: one round trip, and the
  // `is_inhouse` flag the API sets is what decides which tab a package lands in.
  const { data: cateringRaw, isLoading: cateringLoading } = useQuery({
    queryKey: ["cateringOptions", venueId, eventDate],
    queryFn: async () => {
      const res = await api.get("/catering/catering-packages/available/", {
        params: { venue_id: venueId, date: eventDate || undefined },
      });
      return (res.data?.data ?? res.data ?? []) as (ServiceOption & { is_inhouse?: boolean })[];
    },
    enabled: signedIn && !!venue,
  });

  const { data: decorRaw, isLoading: decorLoading } = useQuery({
    queryKey: ["decorOptions", venueId, eventDate],
    queryFn: async () => {
      const res = await api.get("/decorations/decoration-packages/available/", {
        params: { venue_id: venueId, date: eventDate || undefined },
      });
      return (res.data?.data ?? res.data ?? []) as (ServiceOption & { is_inhouse?: boolean })[];
    },
    enabled: signedIn && !!venue,
  });

  const cateringInhouse = useMemo(() => (cateringRaw ?? []).filter((p) => p.is_inhouse), [cateringRaw]);
  const cateringExternal = useMemo(() => (cateringRaw ?? []).filter((p) => !p.is_inhouse), [cateringRaw]);
  const decorInhouse = useMemo(() => (decorRaw ?? []).filter((p) => p.is_inhouse), [decorRaw]);
  const decorExternal = useMemo(() => (decorRaw ?? []).filter((p) => !p.is_inhouse), [decorRaw]);

  /** In-house is the default when the owner offers it and the policy allows. */
  const defaultSource = (policy: ServicePolicy, inhouseCount: number): ServiceSource => {
    if (policy === "none") return "none";
    return inhouseCount > 0 && policy !== "external" ? "inhouse" : "external";
  };

  const cateringSource = cateringSourcePick ?? defaultSource(cateringPolicy, cateringInhouse.length);
  const decorSource = decorSourcePick ?? defaultSource(decorPolicy, decorInhouse.length);

  const activeCatering = cateringSource === "inhouse" ? cateringInhouse : cateringExternal;
  const activeDecor = decorSource === "inhouse" ? decorInhouse : decorExternal;

  // A pick only counts while it's still in the visible list — switching tabs or
  // changing the date falls back to the first option rather than going blank.
  const cateringPkgId = activeCatering.some((p) => String(p.id) === cateringPkgPick)
    ? cateringPkgPick
    : activeCatering[0] ? String(activeCatering[0].id) : "";
  const decorPkgId = activeDecor.some((p) => String(p.id) === decorPkgPick)
    ? decorPkgPick
    : activeDecor[0] ? String(activeDecor[0].id) : "";

  const selectedCateringPkg = activeCatering.find((p) => String(p.id) === cateringPkgId);
  const selectedDecorPkg = activeDecor.find((p) => String(p.id) === decorPkgId);

  // ── Quote ─────────────────────────────────────────────────────────────
  // Computed client-side from the selections on screen so the total moves the
  // moment a dish or tier changes. No platform service fee is charged.
  const quote = useMemo(() => {
    const rent = Number(venue?.price_per_day ?? 0);

    let catering = 0;
    if (cateringSource !== "none" && selectedCateringPkg) {
      const base = Number(selectedCateringPkg.price_per_plate ?? 0);
      const addons = (selectedCateringPkg.menu_items ?? [])
        .filter((it: { id: number }) => selectedFoodIds.includes(it.id))
        .reduce((sum: number, it: { addon_price?: string | number }) => sum + (Number(it.addon_price) || 0), 0);
      catering = (base + addons) * guests;
    }

    let decor = 0;
    let decorLabel = "";
    if (decorSource === "external" && selectedDecorPkg) {
      const tier = selectedDecorPkg.tiers?.find((t) => String(t.tier) === decorTier)
        ?? selectedDecorPkg.tiers?.[0];
      decor = Number(tier?.price ?? 0);
      decorLabel = `${selectedDecorPkg.name}${tier ? ` · ${tier.tier}` : ""}`;
    } else if (decorSource === "inhouse") {
      if (selectedDecorPkg) {
        const tier = selectedDecorPkg.tiers?.find((t) => String(t.tier) === decorTier)
          ?? selectedDecorPkg.tiers?.[0];
        decor = Number(tier?.price ?? 0);
        decorLabel = selectedDecorPkg.name;
      } else {
        const theme = INHOUSE_THEMES.find((t) => t.id === inhouseTheme);
        decor = 25000 + (theme?.price ?? 0);
        decorLabel = theme?.name ?? "Standard Theme";
      }
    }

    const subtotal = rent + catering + decor;
    const gst = subtotal * 0.18;
    return { rent, catering, decor, decorLabel, subtotal, gst, total: subtotal + gst };
  }, [
    venue?.price_per_day, guests, cateringSource, decorSource,
    selectedCateringPkg, selectedDecorPkg, decorTier, inhouseTheme, selectedFoodIds,
  ]);

  // ── Enquiry ───────────────────────────────────────────────────────────
  const inquiry = useMutation({
    mutationFn: async () => {
      const name = storeUser?.full_name || "Customer";
      const phone = storeUser?.phone || storeOnboardingPhone || "";
      const res = await api.post("/bookings/inquiries/", {
        venue: venueId,
        name,
        phone,
        guest_count: guests,
        event_date: eventDate,
        catering_package: cateringPkgId ? Number(cateringPkgId) : null,
        decoration_package: decorSource === "external" && decorPkgId ? Number(decorPkgId) : null,
        message:
          `Enquiry for ${venue?.name}. ${guests} guests on ${eventDate || "a date to be confirmed"}. ` +
          `Catering: ${cateringSource}${selectedCateringPkg ? ` (${selectedCateringPkg.name})` : ""}. ` +
          `Decor: ${decorSource}${quote.decorLabel ? ` (${quote.decorLabel})` : ""}.`,
      });
      return res.data;
    },
    onSuccess: () => setSubmitted(true),
  });

  const handleEnquire = () => {
    if (!signedIn || !eventDate) {
      setGateOpen(true);
      return;
    }
    inquiry.mutate();
  };

  const applyBrief = (brief: DiscoveryBrief) => {
    if (brief.date) setEventDate(brief.date);
    if (brief.guests) setGuests(brief.guests);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f5f3ef]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!venue) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-24 text-center bg-[#f5f3ef] min-h-screen">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <h1 className="text-lg font-semibold text-gray-800">Venue not found</h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">It may have been removed or taken offline.</p>
          <Link href="/venues" className="btn-gold inline-flex rounded-xl px-5 py-2.5 text-sm">
            Browse all venues
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const photos: VenuePhoto[] = (venue.images ?? []).map(
    (img: { id: number; image: string; folder?: string; caption?: string; is_primary?: boolean }) => ({
      id: img.id,
      image: img.image,
      folder: img.folder || "general",
      caption: img.caption,
      is_primary: img.is_primary,
    })
  );

  const heroImage = photos.find((p) => p.is_primary)?.image || photos[0]?.image || FALLBACK_IMAGE;
  const rating = Number(venue.avg_rating ?? 0);
  const rooms = (venue.num_ac_rooms || 0) + (venue.num_non_ac_rooms || 0);

  const amenities = [
    { label: "Parking", value: venue.has_parking, icon: Car },
    { label: "Air conditioned", value: venue.is_ac, icon: AirVent },
    { label: "Guest rooms", value: rooms > 0, icon: BedDouble },
    { label: "Swimming pool", value: venue.has_pool, icon: Waves },
    { label: "Open-air lawn", value: venue.is_outdoor, icon: PartyPopper },
    { label: "Accommodation", value: venue.has_accommodation, icon: Building2 },
  ];

  return (
    <>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative h-[52vh] min-h-[360px] w-full overflow-hidden bg-black">
        <Image src={heroImage} alt={venue.name} fill className="object-cover opacity-55" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25" />

        <div className="absolute top-20 left-4 sm:left-8">
          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg transition-all hover:bg-white/20"
          >
            <ArrowLeft size={13} /> Back to Venues
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {VENUE_TYPE_LABELS[venue.venue_type] || venue.venue_type}
                </span>
                {venue.is_verified && (
                  <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={10} /> KYC Verified
                  </span>
                )}
                <span className="bg-white/10 text-white/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin size={9} /> {venue.city}, {venue.state}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-white leading-tight">
                {venue.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-white/70 text-xs flex-wrap">
                {rating > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <strong className="text-white">{rating.toFixed(1)}</strong>
                      ({venue.total_bookings} bookings)
                    </span>
                    <span className="w-px h-3 bg-white/30" />
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Users size={11} className="text-white/50" /> up to {venue.max_capacity?.toLocaleString("en-IN")} guests
                </span>
                {rooms > 0 && (
                  <>
                    <span className="w-px h-3 bg-white/30" />
                    <span className="flex items-center gap-1">
                      <BedDouble size={11} className="text-white/50" /> {rooms} rooms
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Starting from</p>
              <p className="text-3xl font-bold text-gold">
                ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
                <span className="text-sm font-normal text-white/50">/day</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <main className="bg-[#f5f3ef] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {photos.length > 0 && <VenueGallery photos={photos} venueName={venue.name} />}

              {/* Fast facts */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Capacity", value: `${venue.max_capacity?.toLocaleString("en-IN")}`, icon: Users },
                  { label: "Halls", value: venue.num_halls || "—", icon: Building2 },
                  { label: "Rooms", value: rooms || "—", icon: BedDouble },
                  { label: "Rating", value: rating > 0 ? rating.toFixed(1) : "New", icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <Icon size={15} className="mx-auto text-gold mb-1" />
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                {([
                  ["overview", "Overview"],
                  ["spaces", "Spaces & Amenities"],
                  ["policies", "Service Policies"],
                ] as const).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => setTab(code)}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                      tab === code ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "overview" && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                  <h2 className="font-heading font-semibold text-base text-gray-900">About this venue</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {venue.description}
                  </p>
                  {venue.address && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Address</p>
                      <p className="text-sm text-gray-700 flex items-start gap-1.5">
                        <MapPin size={13} className="text-gold shrink-0 mt-0.5" />
                        {venue.address}{venue.pincode ? ` — ${venue.pincode}` : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tab === "spaces" && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                  <h2 className="font-heading font-semibold text-base text-gray-900">Spaces &amp; amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {amenities.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                          value
                            ? "bg-emerald-50/60 border-emerald-200 text-gray-800"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon size={13} className={value ? "text-emerald-600" : "text-gray-300"} />
                        <span className={value ? "" : "line-through"}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-center">
                    {[
                      ["AC rooms", venue.num_ac_rooms],
                      ["Non-AC rooms", venue.num_non_ac_rooms],
                      ["Banquet halls", venue.num_halls],
                      ["Dormitory beds", venue.dormitory_capacity],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <p className="text-base font-bold text-gray-900">{Number(value) || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "policies" && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <h2 className="font-heading font-semibold text-base text-gray-900">What this venue allows</h2>
                  <p className="text-xs text-gray-500">
                    Each service is either run by the venue itself, opened up to outside vendors, or not offered.
                  </p>
                  <div className="divide-y divide-gray-100">
                    {[
                      ["Catering", venue.catering_policy],
                      ["Decoration", venue.decoration_policy],
                      ["DJ & sound", venue.dj_policy],
                      ["Wedding planner", venue.planner_policy],
                    ].map(([label, policy]) => (
                      <div key={String(label)} className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-gray-700">{label}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            policy === "none"
                              ? "bg-gray-50 text-gray-500 border-gray-200"
                              : policy === "inhouse"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : policy === "external"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {policy === "none" ? "Not offered"
                            : policy === "inhouse" ? "In-house only"
                            : policy === "external" ? "Outside vendors only"
                            : "In-house or outside"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu builder for the chosen catering package */}
              {signedIn && cateringSource !== "none" && selectedCateringPkg?.menu_items?.length ? (
                <CateringMenuBuilder
                  pkg={selectedCateringPkg as never}
                  selectedIds={selectedFoodIds}
                  onChange={setSelectedFoodIds}
                />
              ) : null}
            </div>

            {/* ── Right: quote builder ─────────────────────────── */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Build your quote</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-gray-400"> /day venue rent</span>
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 text-center space-y-3">
                    <CheckCircle2 size={34} className="mx-auto text-emerald-500" />
                    <h3 className="font-semibold text-gray-900">Enquiry sent</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {venue.name} has your details and will call you shortly to confirm{" "}
                      {eventDate
                        ? new Date(eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                        : "your date"}.
                    </p>
                    <Link href="/venues" className="inline-block text-xs font-semibold text-gold hover:underline">
                      Browse more venues
                    </Link>
                  </div>
                ) : !signedIn ? (
                  /* Gated: show the shape of the quote, not the numbers. */
                  <div className="p-5 space-y-4">
                    <div className="space-y-2.5 blur-[5px] select-none pointer-events-none" aria-hidden="true">
                      {["Venue rent", "Catering", "Decoration", "GST (18%)", "Total"].map((row) => (
                        <div key={row} className="flex justify-between text-xs text-gray-500">
                          <span>{row}</span>
                          <span>₹00,00,000</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center space-y-2">
                      <Lock size={18} className="mx-auto text-gold" />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Verify your number to see live pricing, check this venue&apos;s availability on your date,
                        and pick catering and decor.
                      </p>
                    </div>
                    <button
                      onClick={() => setGateOpen(true)}
                      className="btn-gold w-full justify-center rounded-xl py-3 text-sm"
                    >
                      Check availability &amp; pricing
                    </button>
                  </div>
                ) : (
                  <div className="p-5 space-y-5">
                    {/* Guests + date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                          Guests
                        </label>
                        <input
                          type="number"
                          min={10}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-gold focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                          Event date
                        </label>
                        <input
                          type="date"
                          min={todayISO()}
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-gold focus:bg-white [color-scheme:light]"
                        />
                      </div>
                    </div>

                    {eventDate && (
                      <p className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                        <CalendarDays size={11} /> Showing vendors free on this date.
                      </p>
                    )}

                    <ServiceSourcePicker
                      kind="catering"
                      policy={cateringPolicy}
                      source={cateringSource}
                      onSourceChange={setCateringSourcePick}
                      inhouseOptions={cateringInhouse}
                      externalOptions={cateringExternal}
                      loading={cateringLoading}
                      selectedId={cateringPkgId}
                      onSelect={(id) => { setCateringPkgPick(id); setSelectedFoodIds([]); }}
                    />

                    <ServiceSourcePicker
                      kind="decoration"
                      policy={decorPolicy}
                      source={decorSource}
                      onSourceChange={setDecorSourcePick}
                      inhouseOptions={decorInhouse}
                      externalOptions={decorExternal}
                      loading={decorLoading}
                      selectedId={decorPkgId}
                      onSelect={setDecorPkgPick}
                    >
                      {selectedDecorPkg?.tiers && selectedDecorPkg.tiers.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Decoration tier
                          </label>
                          <select
                            value={decorTier}
                            onChange={(e) => setDecorTier(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-gold focus:bg-white"
                          >
                            {selectedDecorPkg.tiers.map((t) => (
                              <option key={t.id} value={t.tier}>
                                {String(t.tier).toUpperCase()} — ₹{Number(t.price).toLocaleString("en-IN")}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </ServiceSourcePicker>

                    {/* In-house theme upgrade — only when the owner lists no real packages */}
                    {decorSource === "inhouse" && decorInhouse.length === 0 && decorPolicy !== "none" && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                          Decor theme
                        </label>
                        <select
                          value={inhouseTheme}
                          onChange={(e) => setInhouseTheme(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-gold focus:bg-white"
                        >
                          {INHOUSE_THEMES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.price ? `(+₹${t.price.toLocaleString("en-IN")})` : "(included)"}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* ── Breakdown ─────────────────────────────── */}
                    <div className="space-y-2.5 bg-[#f9fafb] border border-gray-100 rounded-xl p-4 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Venue rent</span>
                        <span className="font-medium text-gray-900">₹{quote.rent.toLocaleString("en-IN")}</span>
                      </div>
                      {cateringSource !== "none" && (
                        <div className="flex justify-between">
                          <span>
                            Catering · {guests} guests
                            <span className="text-gray-400"> ({cateringSource === "inhouse" ? "in-house" : "external"})</span>
                          </span>
                          <span className="font-medium text-gray-900">₹{Math.round(quote.catering).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {decorSource !== "none" && (
                        <div className="flex justify-between">
                          <span>
                            Decoration
                            {quote.decorLabel && <span className="text-gray-400"> · {quote.decorLabel}</span>}
                          </span>
                          <span className="font-medium text-gray-900">₹{Math.round(quote.decor).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-200 pt-2.5 font-bold text-gray-900">
                        <span>Subtotal</span>
                        <span>₹{Math.round(quote.subtotal).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>GST (18%)</span>
                        <span>₹{Math.round(quote.gst).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2.5 font-bold text-[15px] text-gold">
                        <span>Total quote</span>
                        <span>₹{Math.round(quote.total).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="flex items-start gap-1.5 text-[10px] text-gray-400 pt-1">
                        <Info size={10} className="shrink-0 mt-0.5" />
                        No platform service fee. You pay the vendor rate plus GST.
                      </p>
                    </div>

                    <button
                      onClick={handleEnquire}
                      disabled={inquiry.isPending}
                      className="btn-gold w-full justify-center rounded-xl py-3 text-sm disabled:opacity-60"
                    >
                      {inquiry.isPending
                        ? <Loader2 size={15} className="animate-spin" />
                        : <><Sparkles size={15} /> Send enquiry</>}
                    </button>
                    {inquiry.isError && (
                      <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {(inquiry.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                          || "Could not send your enquiry. Please try again."}
                      </p>
                    )}
                    {!eventDate && (
                      <p className="text-[10px] text-gray-400 text-center">
                        Pick a date to confirm this venue is free.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <p className="flex items-start gap-1.5 text-[10px] text-gray-400 px-1">
                <Check size={11} className="text-emerald-500 shrink-0 mt-px" />
                Physically audited venue. Enquiries are free and never shared beyond this vendor.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PlanningGateModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        kind="venue"
        title={venue.name}
        subtitle="Verify your number to unlock live pricing and this venue's availability on your date."
        initialBrief={{ city: venue.city, date: eventDate, guests }}
        onComplete={applyBrief}
      />
    </>
  );
}
