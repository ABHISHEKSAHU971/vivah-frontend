"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Users, DollarSign, Calendar, Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
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
        const data = bookingRes.data.data?.bookings || bookingRes.data.bookings || bookingRes.data.results || bookingRes.data || [];
        setBookings(data);
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

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Partner Console Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Review confirmed venue bookings and event schedules</p>
      </div>

      <hr className="border-gray-100" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Services", val: String(listingCount), icon: Star, color: "text-amber-500 bg-amber-50" },
          { label: "Confirmed Bookings", val: String(bookings.length), icon: Calendar, color: "text-blue-500 bg-blue-50" },
          { label: "Total Guests Covered", val: String(bookings.reduce((sum, b) => sum + (b.guest_count || 0), 0)), icon: Users, color: "text-emerald-500 bg-emerald-50" },
          { label: "Total Booked Revenue", val: `\u20b9${(totalEarnings / 100000).toFixed(1)}L`, icon: DollarSign, color: "text-purple-500 bg-purple-50" },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="border border-gray-100 p-4 rounded-xl shadow-sm flex items-center gap-4 bg-zinc-50/50">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">{s.label}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">{s.val}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmed Bookings Table */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-lg text-gray-900 flex items-center gap-1.5">
          <CheckCircle size={18} className="text-emerald-600" /> Confirmed Event Bookings
        </h3>

        {loading ? (
          <div className="border border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 bg-white shadow-sm">
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
          <div className="border border-gray-150 border-dashed rounded-2xl p-12 text-center bg-zinc-50/30">
            <Calendar size={36} className="mx-auto text-zinc-300 mb-2" />
            <h4 className="text-sm font-semibold text-gray-900">No confirmed bookings yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              When the PlanMyVivah team confirms customer bookings for your venue, they will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-gray-500 border-b border-gray-100">
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
