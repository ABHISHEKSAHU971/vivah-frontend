"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star, Users, DollarSign, Calendar, Loader2, AlertCircle, CheckCircle, ArrowRight,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { api } from "@/lib/api";

interface ConfirmedBooking {
  id: number;
  venue: number;
  venue_name: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  event_date: string;
  session: string;
  guest_count: number;
  event_type: string;
  total_amount: string;
  advance_paid: string;
  balance_due: string;
  status: string;
  created_at: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/bookings/vendor/bookings/"),
      api.get("/listings/"),
    ])
      .then(([bookingRes, listingRes]) => {
        // The last fallback is the raw envelope object, so guard the shape —
        // an object here would blow up the `.reduce` below and white-screen the page.
        const data =
          bookingRes.data.data?.bookings || bookingRes.data.bookings ||
          bookingRes.data.results || bookingRes.data || [];
        setBookings(Array.isArray(data) ? data : []);
        const listingData = listingRes.data.data?.listings || listingRes.data.listings || [];
        setListingCount(Array.isArray(listingData) ? listingData.length : 0);
      })
      .catch((err) => {
        console.error("[fetch vendor bookings error]", err);
        const serverMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error;
        setError(serverMsg || "Could not retrieve confirmed bookings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalEarnings = bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

  const totalGuests = bookings.reduce((sum, b) => sum + (b.guest_count || 0), 0);
  const pendingBalance = bookings.reduce((sum, b) => sum + (parseFloat(b.balance_due) || 0), 0);

  const stats = [
    {
      label: "Active Services",
      val: String(listingCount),
      caption: listingCount === 1 ? "1 listing published" : `${listingCount} listings published`,
      icon: Star,
      tile: "tile-gold",
    },
    {
      label: "Confirmed Bookings",
      val: String(bookings.length),
      caption: "All time confirmed events",
      icon: Calendar,
      tile: "tile-indigo",
    },
    {
      label: "Total Guests Covered",
      val: totalGuests.toLocaleString("en-IN"),
      caption: "Across every confirmed event",
      icon: Users,
      tile: "tile-emerald",
    },
    {
      label: "Total Booked Revenue",
      val: `\u20b9${(totalEarnings / 100000).toFixed(1)}L`,
      caption: pendingBalance > 0
        ? `\u20b9${pendingBalance.toLocaleString("en-IN")} balance due`
        : "Fully settled",
      icon: DollarSign,
      tile: "tile-violet",
      trend: pendingBalance > 0 ? { dir: "down" as const, text: "Balance pending" } : undefined,
    },
  ];

  return (
    <div className="space-y-7 font-body">

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="console-card console-card-hover p-4">
              <div className="flex items-start justify-between gap-2">
                <span className={`console-tile ${s.tile}`}>
                  <Icon size={18} />
                </span>
                {s.trend && (
                  <span className={`console-trend console-trend-${s.trend.dir}`}>
                    {s.trend.dir === "down" ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {s.trend.text}
                  </span>
                )}
              </div>
              <p className="console-stat-label mt-3.5">{s.label}</p>
              <p className="console-stat-value mt-1">{s.val}</p>
              <p className="console-stat-caption mt-1">{s.caption}</p>
            </div>
          );
        })}
      </div>

      {/* Confirmed Bookings */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base text-[#101828] flex items-center gap-1.5">
          <CheckCircle size={17} className="text-emerald-600" /> Confirmed Event Bookings
        </h3>

        {loading ? (
          <div className="console-card p-10 flex flex-col items-center justify-center gap-2 text-[#98A2B3]">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="text-xs">Loading confirmed venue bookings...</p>
          </div>
        ) : error ? (
          <div className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold">Error loading bookings</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="console-card p-12 text-center">
            <Calendar size={36} className="mx-auto text-zinc-300 mb-2" />
            <h4 className="text-sm font-semibold text-gray-900">No confirmed bookings yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              When the PlanMyVivah team confirms customer bookings for your venue, they will appear here.
            </p>
          </div>
        ) : (
          <div className="console-card overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#667085] border-b border-[#EAECF0]">
                  <th className="p-3 font-semibold">Booked Date</th>
                  <th className="p-3 font-semibold">Venue Name</th>
                  <th className="p-3 font-semibold">Customer Details</th>
                  <th className="p-3 font-semibold">Guest Size</th>
                  <th className="p-3 font-semibold">Total Amount</th>
                  <th className="p-3 font-semibold">Balance Due</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-emerald-50/20 text-gray-700 transition-colors">
                    <td className="p-3 font-bold text-indigo-600">
                      {new Date(booking.event_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="p-3 font-medium text-gray-950">{booking.venue_name}</td>
                    <td className="p-3">
                      <span className="font-semibold text-gray-900 block">{booking.customer_name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{booking.customer_phone}</span>
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {booking.guest_count ? `${booking.guest_count} Guests` : "N/A"}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {"\u20b9"}{parseFloat(booking.total_amount).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-rose-600">
                      {"\u20b9"}{parseFloat(booking.balance_due).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/vendor/bookings/${booking.id}`)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                      >
                        View Full Details
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
