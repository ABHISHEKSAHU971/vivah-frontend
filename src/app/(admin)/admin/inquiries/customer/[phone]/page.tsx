"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Building,
  Utensils,
  Palette,
  UserCheck,
  Check,
  Briefcase,
  X,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";

interface Inquiry {
  id: number;
  venue: number;
  venue_name: string;
  user: number | null;
  name: string;
  phone: string;
  email: string;
  location: string;
  budget: string | null;
  rooms_needed: number | null;
  event_date: string | null;
  event_type: string;
  guest_count: number | null;
  catering_package?: number | null;
  catering_package_name?: string | null;
  decoration_package?: number | null;
  decoration_package_name?: string | null;
  message: string;
  status: string;
  created_at: string;
}

export default function CustomerInquiriesPage({ params }: { params: Promise<{ phone: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rawPhone = decodeURIComponent(resolvedParams.phone);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Confirm Booking Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    inquiry: Inquiry | null;
    venueAmount: string;
    cateringAmount: string;
    decorationAmount: string;
    djAmount: string;
    advancePaid: string;
    session: string;
    notes: string;
  }>({
    isOpen: false,
    inquiry: null,
    venueAmount: "",
    cateringAmount: "0",
    decorationAmount: "0",
    djAmount: "0",
    advancePaid: "0",
    session: "full_day",
    notes: "",
  });

  // Service Options states for edit modal
  const [allVenues, setAllVenues] = useState<{ id: number; name: string; city?: string; price_per_day?: string }[]>([]);
  const [allCateringPkgs, setAllCateringPkgs] = useState<{ id: number; name: string; cuisine_type?: string; price_per_plate?: string }[]>([]);
  const [allDecorPkgs, setAllDecorPkgs] = useState<{ id: number; name: string; style?: string }[]>([]);

  // Edit Inquiry Modal
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    inquiry: Inquiry | null;
    venue_id: string;
    catering_package_id: string;
    decoration_package_id: string;
    name: string;
    phone: string;
    location: string;
    event_date: string;
    guest_count: string;
    budget: string;
    message: string;
    status: string;
  }>({
    isOpen: false,
    inquiry: null,
    venue_id: "",
    catering_package_id: "",
    decoration_package_id: "",
    name: "",
    phone: "",
    location: "",
    event_date: "",
    guest_count: "",
    budget: "",
    message: "",
    status: "pending",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCustomerInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/venues/admin/customers/${encodeURIComponent(rawPhone)}/inquiries/`);
      setInquiries(res.data?.data?.inquiries || []);
    } catch (err: any) {
      console.error("[fetch customer inquiries error]", err);
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to load customer inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerInquiries();

    // Fetch service catalogs for admin edit options
    api.get("/venues/venues/").then((res) => {
      setAllVenues(res.data?.results || res.data?.data?.results || res.data?.data || res.data || []);
    }).catch(() => {});

    api.get("/catering/catering-packages/").then((res) => {
      setAllCateringPkgs(res.data?.results || res.data?.data?.results || res.data?.data || res.data || []);
    }).catch(() => {});

    api.get("/decorations/decoration-packages/").then((res) => {
      setAllDecorPkgs(res.data?.results || res.data?.data?.results || res.data?.data || res.data || []);
    }).catch(() => {});
  }, [rawPhone]);

  const handleConfirmBookingSubmit = async () => {
    if (!confirmModal.inquiry) return;
    if (!confirmModal.venueAmount || isNaN(Number(confirmModal.venueAmount))) {
      alert("Please enter a valid venue amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/bookings/admin/inquiries/${confirmModal.inquiry.id}/confirm/`, {
        venue_amount: parseFloat(confirmModal.venueAmount),
        catering_amount: parseFloat(confirmModal.cateringAmount || "0"),
        decoration_amount: parseFloat(confirmModal.decorationAmount || "0"),
        dj_amount: parseFloat(confirmModal.djAmount || "0"),
        advance_paid: parseFloat(confirmModal.advancePaid || "0"),
        session: confirmModal.session,
        notes: confirmModal.notes,
      });

      showToast(res.data?.message || "🎉 Booking confirmed successfully!");
      setConfirmModal({
        isOpen: false,
        inquiry: null,
        venueAmount: "",
        cateringAmount: "0",
        decorationAmount: "0",
        djAmount: "0",
        advancePaid: "0",
        session: "full_day",
        notes: "",
      });

      fetchCustomerInquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.detail || "Failed to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInquirySubmit = async () => {
    if (!editModal.inquiry) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/venues/admin/inquiries/${editModal.inquiry.id}/`, {
        venue: editModal.venue_id ? parseInt(editModal.venue_id) : null,
        catering_package: editModal.catering_package_id ? parseInt(editModal.catering_package_id) : null,
        decoration_package: editModal.decoration_package_id ? parseInt(editModal.decoration_package_id) : null,
        name: editModal.name,
        phone: editModal.phone,
        location: editModal.location,
        event_date: editModal.event_date || null,
        guest_count: editModal.guest_count ? parseInt(editModal.guest_count) : null,
        budget: editModal.budget ? parseFloat(editModal.budget) : null,
        message: editModal.message,
        status: editModal.status,
      });

      showToast("Inquiry updated successfully!");
      setEditModal({
        isOpen: false,
        inquiry: null,
        venue_id: "",
        catering_package_id: "",
        decoration_package_id: "",
        name: "",
        phone: "",
        location: "",
        event_date: "",
        guest_count: "",
        budget: "",
        message: "",
        status: "pending",
      });

      fetchCustomerInquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.detail || "Failed to update inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryInquiry = inquiries[0];
  const customerName = primaryInquiry?.name || "Customer Profile";

  const groupedByDate = useMemo(() => {
    const map: { [key: string]: Inquiry[] } = {};
    inquiries.forEach((inq) => {
      const key = inq.event_date || "No Event Date Set";
      if (!map[key]) map[key] = [];
      map[key].push(inq);
    });
    return Object.entries(map).map(([dateStr, items]) => ({ dateStr, items }));
  }, [inquiries]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-7xl mx-auto font-body">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="p-1 bg-emerald-500 rounded-full text-white">
            <Check size={14} />
          </div>
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <button
          onClick={fetchCustomerInquiries}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : ""} /> Sync Data
        </button>
      </div>

      {/* Main Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
              Managed Concierge Customer Record
            </span>
            <h1 className="text-2xl font-bold font-heading mt-2">{customerName}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-300 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5"><Phone size={13} className="text-indigo-400" /> {rawPhone}</span>
              {primaryInquiry?.email && (
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-indigo-400" /> {primaryInquiry.email}</span>
              )}
              {primaryInquiry?.location && (
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-indigo-400" /> {primaryInquiry.location}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Date Groups</span>
              <span className="text-3xl font-extrabold text-white">{groupedByDate.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Total Enquiries</span>
              <span className="text-3xl font-extrabold text-white">{inquiries.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Content */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw size={28} className="animate-spin text-indigo-600" />
          <p className="text-xs font-semibold">Retrieving customer inquiry details...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-semibold">{error}</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400">
          <FileText size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No inquiries found for phone {rawPhone}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByDate.map(({ dateStr, items }) => (
            <div key={dateStr} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              {/* Event Date Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Event Date: {dateStr !== "No Event Date Set" ? new Date(dateStr).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }) : "Date Not Specified"}
                  </h2>
                </div>
                <span className="px-3 py-1 text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  {items.length} Service {items.length === 1 ? 'Request' : 'Requests'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {items.map((inq) => (

              <div
                key={inq.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-600">Inquiry #{inq.id}</span>
                    <span className="text-xs text-slate-400 ml-3">
                      Logged on {new Date(inq.created_at).toLocaleString("en-IN", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      inq.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : inq.status === "closed"
                        ? "bg-slate-100 text-slate-600 border border-slate-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {inq.status}
                    </span>

                    <button
                      onClick={() => setEditModal({
                        isOpen: true,
                        inquiry: inq,
                        venue_id: inq.venue ? String(inq.venue) : "",
                        catering_package_id: inq.catering_package ? String(inq.catering_package) : "",
                        decoration_package_id: inq.decoration_package ? String(inq.decoration_package) : "",
                        name: inq.name || "",
                        phone: inq.phone || "",
                        location: inq.location || "",
                        event_date: inq.event_date || "",
                        guest_count: inq.guest_count ? String(inq.guest_count) : "",
                        budget: inq.budget ? String(inq.budget) : "",
                        message: inq.message || "",
                        status: inq.status || "pending",
                      })}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-xl transition-all"
                    >
                      Edit Inquiry
                    </button>

                    {inq.status !== "confirmed" && (
                      <button
                        onClick={() => setConfirmModal({
                          isOpen: true,
                          inquiry: inq,
                          venueAmount: inq.budget ? String(inq.budget) : "50000",
                          cateringAmount: "0",
                          decorationAmount: "0",
                          djAmount: "0",
                          advancePaid: "10000",
                          session: "full_day",
                          notes: "",
                        })}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
                      >
                        <Check size={14} /> Confirm Booking
                      </button>
                    )}
                  </div>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Venue Card */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-[11px] uppercase tracking-wide">
                      <Building size={14} /> Venue Selection
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{inq.venue_name || "Direct Vendor Request"}</h4>
                    <p className="text-slate-500">Target Area: <span className="font-semibold text-slate-700">{inq.location || "Not specified"}</span></p>
                  </div>

                  {/* Catering Card */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-[11px] uppercase tracking-wide">
                      <Utensils size={14} /> Catering Package
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{inq.catering_package_name || "None / Standard Venue Catering"}</h4>
                    <p className="text-slate-500">Guests Expected: <span className="font-semibold text-slate-700">{inq.guest_count ? `${inq.guest_count} Plates` : "Not specified"}</span></p>
                  </div>

                  {/* Decoration Card */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-[11px] uppercase tracking-wide">
                      <Palette size={14} /> Decoration Theme
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{inq.decoration_package_name || "None / Standard Decor"}</h4>
                    <p className="text-slate-500">Estimated Budget: <span className="font-semibold text-slate-700">{inq.budget ? `₹${parseFloat(inq.budget).toLocaleString()}` : "N/A"}</span></p>
                  </div>
                </div>

                {/* Event Specifications */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Event Date</span>
                    <span className="font-bold text-indigo-700 text-sm">
                      {inq.event_date ? new Date(inq.event_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }) : "Flexible / Not Set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Guest Count</span>
                    <span className="font-bold text-slate-900 text-sm">{inq.guest_count || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Budget</span>
                    <span className="font-bold text-slate-900 text-sm">{inq.budget ? `₹${parseFloat(inq.budget).toLocaleString()}` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Event Type</span>
                    <span className="font-bold text-slate-900 text-sm capitalize">{inq.event_type || "Wedding"}</span>
                  </div>
                </div>

                {/* Message Detail */}
                {inq.message && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                    <span className="text-[9px] uppercase font-bold text-slate-400 not-italic block mb-1">Customer Inquiry Requirements:</span>
                    "{inq.message}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )}


      {/* CONFIRM BOOKING MODAL */}
      {confirmModal.isOpen && confirmModal.inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-zoom-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false, inquiry: null }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="font-heading font-bold text-lg text-slate-950 flex items-center gap-2">
              <Check className="text-emerald-600" size={20} /> Confirm Venue Booking
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Create confirmed booking for <strong>{confirmModal.inquiry.name}</strong> ({confirmModal.inquiry.venue_name})
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Venue Booking Amount (₹) *</label>
                <input
                  type="number"
                  value={confirmModal.venueAmount}
                  onChange={(e) => setConfirmModal(prev => ({ ...prev, venueAmount: e.target.value }))}
                  placeholder="e.g. 75000"
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catering Amount (₹)</label>
                  <input
                    type="number"
                    value={confirmModal.cateringAmount}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, cateringAmount: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Decoration Amount (₹)</label>
                  <input
                    type="number"
                    value={confirmModal.decorationAmount}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, decorationAmount: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">DJ / Sound Amount (₹)</label>
                  <input
                    type="number"
                    value={confirmModal.djAmount}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, djAmount: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Advance Received (₹)</label>
                  <input
                    type="number"
                    value={confirmModal.advancePaid}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, advancePaid: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Session Slot</label>
                <select
                  value={confirmModal.session}
                  onChange={(e) => setConfirmModal(prev => ({ ...prev, session: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="full_day">Full Day</option>
                  <option value="morning">Morning (6am–12pm)</option>
                  <option value="afternoon">Afternoon (12pm–6pm)</option>
                  <option value="evening">Evening (6pm–12am)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={confirmModal.notes}
                  onChange={(e) => setConfirmModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Payment reference, special instructions..."
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center font-bold text-sm">
                <span>Calculated Total:</span>
                <span className="text-indigo-600">
                  ₹{(
                    (parseFloat(confirmModal.venueAmount || "0") || 0) +
                    (parseFloat(confirmModal.cateringAmount || "0") || 0) +
                    (parseFloat(confirmModal.decorationAmount || "0") || 0) +
                    (parseFloat(confirmModal.djAmount || "0") || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false, inquiry: null }))}
                className="px-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBookingSubmit}
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-55 inline-flex items-center gap-1.5"
              >
                <Check size={14} /> Lock & Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INQUIRY MODAL */}
      {editModal.isOpen && editModal.inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-zoom-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditModal(prev => ({ ...prev, isOpen: false, inquiry: null }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="font-heading font-bold text-lg text-slate-950 flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={20} /> Modify Customer Inquiry
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update inquiry specifications as requested by customer.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              {/* Venue Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <Building size={14} className="text-indigo-600" /> Venue Selection
                </label>
                <select
                  value={editModal.venue_id}
                  onChange={(e) => setEditModal(prev => ({ ...prev, venue_id: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-semibold text-slate-900"
                >
                  <option value="">-- Select Venue --</option>
                  {allVenues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.city ? `(${v.city})` : ""} {v.price_per_day ? `— ₹${parseFloat(v.price_per_day).toLocaleString()}/day` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catering Package Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <Utensils size={14} className="text-amber-600" /> Catering Package (Select lower/different pricing)
                </label>
                <select
                  value={editModal.catering_package_id}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const selectedPkg = allCateringPkgs.find(p => String(p.id) === catId);
                    let suggestedBudget = editModal.budget;
                    if (selectedPkg && selectedPkg.price_per_plate && editModal.guest_count) {
                      const estCat = parseFloat(selectedPkg.price_per_plate) * parseInt(editModal.guest_count);
                      suggestedBudget = String(estCat);
                    }
                    setEditModal(prev => ({
                      ...prev,
                      catering_package_id: catId,
                      budget: suggestedBudget || prev.budget
                    }));
                  }}
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-800"
                >
                  <option value="">None / Remove Catering Package</option>
                  {allCateringPkgs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.cuisine_type ? `[${p.cuisine_type}]` : ""} {p.price_per_plate ? `— ₹${parseFloat(p.price_per_plate).toLocaleString()}/plate` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Decoration Package Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <Palette size={14} className="text-purple-600" /> Decoration Package Selection
                </label>
                <select
                  value={editModal.decoration_package_id}
                  onChange={(e) => setEditModal(prev => ({ ...prev, decoration_package_id: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-800"
                >
                  <option value="">None / Remove Decoration Package</option>
                  {allDecorPkgs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.style ? `(${p.style})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editModal.name}
                    onChange={(e) => setEditModal(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editModal.phone}
                    onChange={(e) => setEditModal(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location / Preferred Area</label>
                  <input
                    type="text"
                    value={editModal.location}
                    onChange={(e) => setEditModal(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Event Date</label>
                  <input
                    type="date"
                    value={editModal.event_date}
                    onChange={(e) => setEditModal(prev => ({ ...prev, event_date: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Guest Count</label>
                  <input
                    type="number"
                    value={editModal.guest_count}
                    onChange={(e) => setEditModal(prev => ({ ...prev, guest_count: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={editModal.budget}
                    onChange={(e) => setEditModal(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Inquiry Status</label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Special Note / Message</label>
                <textarea
                  rows={3}
                  value={editModal.message}
                  onChange={(e) => setEditModal(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditModal(prev => ({ ...prev, isOpen: false, inquiry: null }))}
                className="px-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditInquirySubmit}
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-55"
              >
                Save Inquiry Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
