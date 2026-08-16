"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, User, Phone, Mail, Calendar, Users,
  MapPin, Utensils, Sparkles, Music2, IndianRupee, CheckCircle2,
  Clock, Hash, Loader2, AlertCircle, Star, Layers
} from "lucide-react";
import { api } from "@/lib/api";

interface VenueInfo {
  id: number;
  name: string;
  venue_type: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  min_capacity: number;
  max_capacity: number;
  num_ac_rooms: number;
  num_non_ac_rooms: number;
  num_halls: number;
  price_per_day: string;
}

interface CateringInfo {
  id: number;
  name: string;
  cuisine_type: string;
  tier: string;
  price_per_plate: string;
  description: string;
  material_option: string;
}

interface DecorationInfo {
  id: number;
  name: string;
  style: string;
  description: string;
  includes: string[];
}

interface DJInfo {
  id: number;
  name: string;
}

interface BookingDetail {
  id: number;
  status: string;
  event_date: string;
  session: string;
  guest_count: number;
  event_type: string;
  venue: number;
  venue_info: VenueInfo | null;
  customer: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  catering_package: number | null;
  catering_info: CateringInfo | null;
  decoration_package: number | null;
  decoration_info: DecorationInfo | null;
  dj_package: number | null;
  dj_info: DJInfo | null;
  venue_amount: string;
  catering_amount: string;
  decoration_amount: string;
  dj_amount: string;
  total_amount: string;
  advance_paid: string;
  balance_due: string;
  notes: string;
  created_at: string;
}

export default function VendorBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    api.get(`/bookings/vendor/bookings/${bookingId}/`)
      .then((res) => {
        setBooking(res.data?.data?.booking || res.data?.booking || res.data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load booking details."
        );
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} />
          <p className="font-semibold">{error || "Booking not found."}</p>
        </div>
      </div>
    );
  }

  const v = booking.venue_info;
  const cat = booking.catering_info;
  const dec = booking.decoration_info;
  const dj = booking.dj_info;

  const fmtAmount = (val: string | number) =>
    `\u20b9${parseFloat(String(val || 0)).toLocaleString("en-IN")}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>
        <span className="text-[10px] uppercase font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Booking #{booking.id}
        </span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-2xl border border-emerald-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#10b981,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest capitalize">
                {booking.status} Booking
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">
              {v?.name || "Venue Booking"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-300">
              {v && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-emerald-400" />
                  {v.city}, {v.state}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-400" />
                {fmtDate(booking.event_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-emerald-400" />
                {booking.guest_count} Guests
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-300">Total Amount</p>
              <p className="text-xl font-extrabold text-white mt-1">{fmtAmount(booking.total_amount)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-rose-300">Balance Due</p>
              <p className="text-xl font-extrabold text-white mt-1">{fmtAmount(booking.balance_due)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Venue + Customer + Services */}
        <div className="lg:col-span-2 space-y-6">

          {/* Venue Details Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-600" />
              <h2 className="font-heading font-bold text-sm text-slate-900">Venue / Garden Details</h2>
            </div>
            {v ? (
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{v.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {v.venue_type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Rate / Day</p>
                    <p className="text-base font-bold text-slate-900">{fmtAmount(v.price_per_day)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                  <span>{v.address}, {v.city} &mdash; {v.pincode}, {v.state}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { label: "Min Capacity", val: `${v.min_capacity} Pax` },
                    { label: "Max Capacity", val: `${v.max_capacity} Pax` },
                    { label: "AC Rooms", val: v.num_ac_rooms },
                    { label: "Non-AC Rooms", val: v.num_non_ac_rooms },
                    { label: "Halls / Banquets", val: v.num_halls },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <p className="text-[9px] uppercase font-bold text-slate-400">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 text-xs text-slate-400">Venue details not available.</div>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              <h2 className="font-heading font-bold text-sm text-slate-900">Customer Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {[
                { label: "Name", val: booking.customer_name || "—", icon: User, color: "bg-blue-100 text-blue-600" },
                { label: "Phone", val: booking.customer_phone || "—", icon: Phone, color: "bg-green-100 text-green-600" },
                { label: "Email", val: booking.customer_email || "—", icon: Mail, color: "bg-purple-100 text-purple-600" },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                    <p className="font-bold text-slate-900 break-all">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Catering */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center gap-2">
                <Utensils size={15} className="text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Catering Package</h3>
              </div>
              {cat ? (
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{cat.name}</p>
                      <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        {cat.cuisine_type}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-bold text-slate-400">Per Plate</p>
                      <p className="font-extrabold text-amber-700">{fmtAmount(cat.price_per_plate)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-amber-50/60 rounded-lg p-2 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Tier</p>
                      <p className="font-bold text-slate-800">{cat.tier}</p>
                    </div>
                    <div className="bg-amber-50/60 rounded-lg p-2 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Material</p>
                      <p className="font-bold text-slate-800 text-[10px] leading-tight">{cat.material_option}</p>
                    </div>
                  </div>
                  {cat.description && <p className="text-slate-500 leading-relaxed">{cat.description}</p>}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 flex justify-between">
                    <span className="font-semibold text-slate-700">Catering Amount</span>
                    <span className="font-bold text-amber-700">{fmtAmount(booking.catering_amount)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                  No catering package selected
                </div>
              )}
            </div>

            {/* Decoration */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 flex items-center gap-2">
                <Sparkles size={15} className="text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Decoration Theme</h3>
              </div>
              {dec ? (
                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{dec.name}</p>
                    <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
                      {dec.style}
                    </span>
                  </div>
                  {dec.description && <p className="text-slate-500 leading-relaxed">{dec.description}</p>}
                  {dec.includes && dec.includes.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Includes</p>
                      <ul className="space-y-1">
                        {dec.includes.map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-slate-700">
                            <Star size={10} className="text-purple-400 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-2.5 flex justify-between">
                    <span className="font-semibold text-slate-700">Decoration Amount</span>
                    <span className="font-bold text-purple-700">{fmtAmount(booking.decoration_amount)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                  No decoration package selected
                </div>
              )}
            </div>

            {/* DJ */}
            {dj && (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-center gap-2">
                  <Music2 size={15} className="text-sky-600" />
                  <h3 className="font-bold text-sm text-slate-900">DJ / Sound Package</h3>
                </div>
                <div className="p-5 text-xs space-y-3">
                  <p className="font-bold text-slate-900 text-sm">{dj.name}</p>
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-2.5 flex justify-between">
                    <span className="font-semibold text-slate-700">DJ Amount</span>
                    <span className="font-bold text-sky-700">{fmtAmount(booking.dj_amount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Event Summary + Financials */}
        <div className="space-y-5">

          {/* Event Summary */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              <h2 className="font-heading font-bold text-sm text-slate-900">Event Summary</h2>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              {[
                { label: "Event Date", val: fmtDate(booking.event_date), icon: Calendar },
                { label: "Session Slot", val: booking.session?.replace(/_/g, " ") || "Full Day", icon: Clock },
                { label: "Event Type", val: booking.event_type || "Wedding", icon: Star },
                { label: "Guest Count", val: `${booking.guest_count} Guests`, icon: Users },
                { label: "Booking ID", val: `#${booking.id}`, icon: Hash },
                { label: "Confirmed On", val: new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: CheckCircle2 },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon size={12} className="text-emerald-500 shrink-0" />
                    <span>{label}</span>
                  </div>
                  <span className="font-bold text-slate-800 capitalize text-right max-w-[55%]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-slate-50 border-b border-slate-100 flex items-center gap-2">
              <IndianRupee size={16} className="text-rose-600" />
              <h2 className="font-heading font-bold text-sm text-slate-900">Financial Breakdown</h2>
            </div>
            <div className="p-5 space-y-2.5 text-xs">
              {[
                { label: "Venue Charge", val: booking.venue_amount, color: "text-indigo-700" },
                ...(parseFloat(booking.catering_amount) > 0
                  ? [{ label: "Catering", val: booking.catering_amount, color: "text-amber-700" }]
                  : []),
                ...(parseFloat(booking.decoration_amount) > 0
                  ? [{ label: "Decoration", val: booking.decoration_amount, color: "text-purple-700" }]
                  : []),
                ...(parseFloat(booking.dj_amount) > 0
                  ? [{ label: "DJ / Sound", val: booking.dj_amount, color: "text-sky-700" }]
                  : []),
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${color}`}>{fmtAmount(val)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-extrabold text-slate-900 text-sm">{fmtAmount(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 font-semibold">Advance Received</span>
                <span className="font-bold text-emerald-700">{fmtAmount(booking.advance_paid)}</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex justify-between items-center">
                <span className="font-bold text-rose-700">Balance Due</span>
                <span className="font-extrabold text-rose-700 text-sm">{fmtAmount(booking.balance_due)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Layers size={15} className="text-slate-500" />
                <h2 className="font-heading font-bold text-sm text-slate-900">Admin Notes</h2>
              </div>
              <div className="p-5 text-xs text-slate-600 leading-relaxed">{booking.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
