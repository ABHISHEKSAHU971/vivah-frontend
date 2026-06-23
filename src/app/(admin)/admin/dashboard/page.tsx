"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Check, 
  X, 
  ShieldAlert, 
  Building, 
  FileText, 
  Calendar, 
  UserCheck, 
  RefreshCw, 
  Filter, 
  Search, 
  TrendingUp, 
  MessageSquare,
  AlertCircle,
  XCircle,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { api } from "@/lib/api";

interface VendorProfile {
  id: number;
  phone: string;
  full_name: string;
  email: string | null;
  vendor_type: string;
  business_name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  gstin: string;
  logo: string | null;
  is_approved: boolean;
  rejection_reason: string;
  created_at: string;
}

interface Listing {
  id: number;
  service_type: string;
  name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  status: string;
  vendor_business_name: string;
  created_at: string;
  updated_at: string;
  details: any;
}

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
  message: string;
  status: string;
  created_at: string;
}

interface InquiryAnalytics {
  date: string;
  count: number;
}

interface Booking {
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"approvals" | "listings" | "queries" | "bookings">("approvals");
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Data states
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [analytics, setAnalytics] = useState<InquiryAnalytics[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Filters & Actions
  const [selectedVenueId, setSelectedVenueId] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [approvalSearch, setApprovalSearch] = useState("");
  const [approvalLocation, setApprovalLocation] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; profileId: number | null; reason: string }>({
    isOpen: false,
    profileId: null,
    reason: "",
  });

  // Action status indicators
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch initial dashboard data
  const fetchData = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const vendorRes = await api.get("/auth/admin/approvals/");
      setVendors(vendorRes.data?.data || []);

      const listingRes = await api.get("/listings/admin/");
      setListings(listingRes.data?.data?.listings || []);

      const inquiryQuery = selectedVenueId !== "all" ? `?venue_id=${selectedVenueId}` : "";
      const inquiryRes = await api.get(`/venues/admin/inquiries/${inquiryQuery}`);
      setInquiries(inquiryRes.data?.data?.inquiries || []);

      const analyticsRes = await api.get(`/venues/admin/inquiries/analytics/${inquiryQuery}`);
      setAnalytics(analyticsRes.data?.data?.analytics || []);

      const bookingQuery = selectedVenueId !== "all" ? `?venue_id=${selectedVenueId}` : "";
      const bookingRes = await api.get(`/bookings/admin/bookings/${bookingQuery}`);
      setBookings(bookingRes.data?.data?.bookings || []);

    } catch (err: any) {
      console.error(err);
      setErrorState(err.response?.data?.detail || err.response?.data?.message || "Failed to load admin dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch venue-specific endpoints when venue ID filter changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const venueQuery = selectedVenueId !== "all" ? `?venue_id=${selectedVenueId}` : "";
        
        const inquiryRes = await api.get(`/venues/admin/inquiries/${venueQuery}`);
        setInquiries(inquiryRes.data?.data?.inquiries || []);

        const analyticsRes = await api.get(`/venues/admin/inquiries/analytics/${venueQuery}`);
        setAnalytics(analyticsRes.data?.data?.analytics || []);

        const bookingRes = await api.get(`/bookings/admin/bookings/${venueQuery}`);
        setBookings(bookingRes.data?.data?.bookings || []);
      } catch (err) {
        console.error("Error fetching filtered venue data:", err);
      }
    };
    if (!loading) {
      fetchFilteredData();
    }
  }, [selectedVenueId]);

  useEffect(() => {
    fetchData();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleApprove = async (profileId: number) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/auth/admin/approvals/${profileId}/`, {
        is_approved: true
      });
      setVendors(prev => prev.map(v => v.id === profileId ? { ...v, is_approved: true, rejection_reason: "" } : v));
      triggerToast(res.data?.message || "Vendor profile approved successfully!");
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || "Failed to approve vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionModal.profileId) return;
    if (!rejectionModal.reason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/auth/admin/approvals/${rejectionModal.profileId}/`, {
        is_approved: false,
        rejection_reason: rejectionModal.reason
      });
      setVendors(prev => prev.map(v => v.id === rejectionModal.profileId ? { ...v, is_approved: false, rejection_reason: rejectionModal.reason } : v));
      setRejectionModal({ isOpen: false, profileId: null, reason: "" });
      triggerToast(res.data?.message || "Vendor profile rejected.");
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || "Failed to reject vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleListingStatus = async (listingId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    setSubmitting(true);
    try {
      const res = await api.patch(`/listings/admin/${listingId}/`, {
        status: nextStatus
      });
      setListings(prev => prev.map(item => item.id === listingId ? { ...item, status: nextStatus } : item));
      triggerToast(res.data?.message || `Listing status updated to ${nextStatus}.`);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || "Failed to update listing status.");
    } finally {
      setSubmitting(false);
    }
  };

  const venuesList = useMemo(() => {
    const venuesMap = new Map<number, string>();
    inquiries.forEach(inq => {
      if (inq.venue && inq.venue_name) venuesMap.set(inq.venue, inq.venue_name);
    });
    bookings.forEach(b => {
      if (b.venue && b.venue_name) venuesMap.set(b.venue, b.venue_name);
    });
    return Array.from(venuesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [inquiries, bookings]);

  const stats = useMemo(() => {
    const pendingVendors = vendors.filter(v => !v.is_approved && !v.rejection_reason).length;
    const totalListings = listings.length;
    const totalQueries = inquiries.length;
    const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;

    return {
      pendingVendors,
      totalListings,
      totalQueries,
      confirmedBookings
    };
  }, [vendors, listings, inquiries, bookings]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      // 1. Status Filter
      if (vendorFilter === "approved" && !v.is_approved) return false;
      if (vendorFilter === "rejected" && (v.is_approved || !v.rejection_reason)) return false;
      if (vendorFilter === "pending" && (v.is_approved || !!v.rejection_reason)) return false;

      // 2. Name Search
      if (approvalSearch) {
        const query = approvalSearch.toLowerCase();
        const matchesName = (v.full_name && v.full_name.toLowerCase().includes(query)) || 
                            (v.business_name && v.business_name.toLowerCase().includes(query)) || 
                            (v.email && v.email.toLowerCase().includes(query)) ||
                            (v.phone && v.phone.toLowerCase().includes(query));
        if (!matchesName) return false;
      }

      // 3. Location Search
      if (approvalLocation) {
        const query = approvalLocation.toLowerCase();
        const matchesLoc = (v.city && v.city.toLowerCase().includes(query)) || 
                           (v.state && v.state.toLowerCase().includes(query));
        if (!matchesLoc) return false;
      }

      return true;
    });
  }, [vendors, vendorFilter, approvalSearch, approvalLocation]);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // 1. Text Search (Vendor Name / Listing Name)
      if (listingSearch) {
        const query = listingSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query) ||
                            item.vendor_business_name.toLowerCase().includes(query);
        if (!matchesName) return false;
      }

      // 2. Location Search
      if (locationFilter) {
        const query = locationFilter.toLowerCase();
        const matchesLoc = item.city.toLowerCase().includes(query) ||
                           item.state.toLowerCase().includes(query);
        if (!matchesLoc) return false;
      }

      // 3. Category Filter
      if (categoryFilter !== "all" && item.service_type !== categoryFilter) return false;

      // 4. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      return true;
    });
  }, [listings, listingSearch, locationFilter, categoryFilter, statusFilter]);

  const renderDetailBadges = (details: any) => {
    if (!details) return <span className="text-gray-400 italic text-[11px]">No specific details logged</span>;
    const labelMap: Record<string, string> = {
      num_ac_rooms: "AC Rooms",
      num_non_ac_rooms: "Non-AC Rooms",
      num_halls: "Halls",
      capacity: "Capacity",
      price_per_day: "Price/Day",
      veg_price_per_plate: "Veg/Plate",
      non_veg_price_per_plate: "Non-Veg/Plate",
      price: "Price",
      experience_years: "Experience",
    };
    return (
      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
        {Object.entries(details).slice(0, 4).map(([key, val]) => {
          if (val === null || val === undefined || val === "") return null;
          const displayLabel = labelMap[key] || key.replace(/_/g, " ");
          const displayVal = (typeof val === "number" || !isNaN(Number(val))) && key.toLowerCase().includes("price") 
            ? `₹${parseFloat(String(val)).toLocaleString()}` 
            : String(val);
          return (
            <span key={key} className="px-2 py-1 text-[10px] bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-medium transition-all hover:bg-slate-100">
              <strong className="text-slate-500 font-semibold uppercase text-[9px] mr-1">{displayLabel}:</strong>
              {displayVal}
            </span>
          );
        })}
        {Object.keys(details).length > 4 && (
          <span className="px-2 py-1 text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md font-semibold italic">
            +{Object.keys(details).length - 4} details
          </span>
        )}
      </div>
    );
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[440px] text-gray-500">
        <RefreshCw className="animate-spin text-indigo-600 mb-4" size={36} />
        <p className="text-sm font-semibold tracking-wide animate-pulse text-indigo-950">Synchronizing database metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative animate-fade-in">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900/95 border border-emerald-500/20 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in backdrop-blur-md">
          <div className="p-1.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Check size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">System Operation Success</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{successToast}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-zinc-900 to-indigo-950 rounded-3xl border border-white/5 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Administrator Mode
          </span>
          <h1 className="text-3xl font-bold font-heading text-white mt-3">Platform Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Oversee registrations, catalog listings, customer inquiries, and scheduled venue bookings.
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="relative z-10 flex items-center justify-center gap-2 self-start md:self-center px-4.5 py-2.5 text-xs font-bold text-white bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl transition-all shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Sync Datasets
        </button>
      </div>

      {errorState && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 text-xs">
          <AlertCircle size={18} />
          <p className="font-semibold">{errorState}</p>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-150 hover:border-indigo-300 rounded-2xl shadow-sm transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Approval Queue</span>
            <div className="p-2 bg-amber-50 group-hover:bg-amber-100 text-amber-500 rounded-xl transition-colors">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingVendors}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Vendors pending approval</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-150 hover:border-indigo-300 rounded-2xl shadow-sm transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Listings</span>
            <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors">
              <Building size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalListings}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Platform offerings registered</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-150 hover:border-indigo-300 rounded-2xl shadow-sm transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Venue Inquiries</span>
            <div className="p-2 bg-rose-50 group-hover:bg-rose-100 text-rose-500 rounded-xl transition-colors">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalQueries}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Customer leads logged</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-150 hover:border-indigo-300 rounded-2xl shadow-sm transition-all duration-300 group hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Confirmed Events</span>
            <div className="p-2 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Locked dates in calendar</p>
          </div>
        </div>
      </div>

      {/* Main Console Panels */}
      <div className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-150 overflow-x-auto scrollbar-none bg-slate-50/50">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === "approvals"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-50"
            }`}
          >
            <UserCheck size={15} />
            Vendor Approvals
            {stats.pendingVendors > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[9px] font-bold text-white bg-amber-500 rounded-full animate-bounce">
                {stats.pendingVendors}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === "listings"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-50"
            }`}
          >
            <Building size={15} />
            Vendor Listings
          </button>

          <button
            onClick={() => setActiveTab("queries")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === "queries"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-50"
            }`}
          >
            <MessageSquare size={15} />
            Inquiries & Analytics
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === "bookings"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-slate-50"
            }`}
          >
            <Calendar size={15} />
            Booked Venues
          </button>
        </div>

        {/* Tab Panel Content */}
        <div className="p-6">
          
          {/* TAB 1: APPROVALS */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              {/* Search & Location Filtering for Approvals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search by business name, owner, phone, email..."
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 placeholder-gray-400 shadow-sm"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-2.5 text-gray-400" size={15} />
                  <input
                    type="text"
                    placeholder="Filter by city, state..."
                    value={approvalLocation}
                    onChange={(e) => setApprovalLocation(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>
              
              {/* Internal Filtering Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  {(["pending", "approved", "rejected", "all"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setVendorFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        vendorFilter === f
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {f} Queue
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-gray-400">
                  Showing {filteredVendors.length} profile(s)
                </span>
              </div>

              {filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-150 rounded-2xl">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 mb-3">
                    <UserCheck size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Clear Registration Queue</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">No vendor profile matches the current status selection.</p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 border-b border-gray-150 font-semibold">
                        <th className="p-4 font-bold">Business Name & Logo</th>
                        <th className="p-4 font-bold">Category</th>
                        <th className="p-4 font-bold">Location</th>
                        <th className="p-4 font-bold">Contact Person</th>
                        <th className="p-4 font-bold">Registration Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVendors.map(vendor => (
                        <tr 
                          key={vendor.id} 
                          className="hover:bg-slate-50/60 border-l-2 border-l-transparent hover:border-l-indigo-600 text-gray-700 transition-all duration-150"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {vendor.logo ? (
                                <img 
                                  src={vendor.logo} 
                                  alt="Logo" 
                                  className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-gray-50"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs uppercase border border-indigo-100">
                                  {vendor.business_name.substring(0, 2)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-gray-900 text-sm block">{vendor.business_name}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5 block">Joined {new Date(vendor.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md capitalize">
                              {vendor.vendor_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-800 font-medium">{vendor.city}</span>
                            <span className="text-[10px] text-slate-400 block">{vendor.state}</span>
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-800 font-bold">{vendor.full_name}</span>
                            <span className="text-[10px] text-slate-400 block">{vendor.phone}</span>
                            {vendor.email && <span className="text-[10px] text-slate-400 block break-all font-mono">{vendor.email}</span>}
                          </td>
                          <td className="p-4">
                            {vendor.is_approved ? (
                              <span className="px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md inline-block">
                                Approved
                              </span>
                            ) : vendor.rejection_reason ? (
                              <div className="space-y-1">
                                <span className="px-2 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-md inline-block">
                                  Rejected
                                </span>
                                <p className="text-[10px] text-rose-500 italic truncate max-w-[150px]" title={vendor.rejection_reason}>
                                  Reason: {vendor.rejection_reason}
                                </p>
                              </div>
                            ) : (
                              <span className="px-2 py-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-md inline-block animate-pulse">
                                Under Review
                              </span>
                            )}
                            {vendor.gstin && (
                              <span className="text-[9px] block mt-1.5 font-mono text-gray-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded w-max">
                                GSTIN: {vendor.gstin}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-2">
                              {!vendor.is_approved && (
                                <button
                                  onClick={() => handleApprove(vendor.id)}
                                  disabled={submitting}
                                  className="px-3 py-1.5 text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-55"
                                >
                                  <Check size={12} /> Approve
                                </button>
                              )}
                              {(vendor.is_approved || (!vendor.is_approved && !vendor.rejection_reason)) && (
                                <button
                                  onClick={() => setRejectionModal({ isOpen: true, profileId: vendor.id, reason: "" })}
                                  disabled={submitting}
                                  className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-55"
                                >
                                  <X size={12} /> Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VENDOR LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              
              {/* Search & Statistics */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-gray-150 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search by listing name or vendor business..."
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 placeholder-gray-400 shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="Filter by location / city..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 placeholder-gray-400 shadow-sm"
                    />
                  </div>
                </div>

                {/* Category Filtering Chips */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Category:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { code: "all", label: "All" },
                      { code: "venue", label: "Venues" },
                      { code: "caterer", label: "Caterers" },
                      { code: "decorator", label: "Decorators" },
                      { code: "dj", label: "DJs" },
                      { code: "planner", label: "Planners" },
                      { code: "photographer", label: "Photographers" },
                      { code: "makeup", label: "Makeup Artists" }
                    ].map(cat => (
                      <button
                        key={cat.code}
                        onClick={() => setCategoryFilter(cat.code)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          categoryFilter === cat.code
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filtering Chips */}
                <div className="flex items-center gap-3 flex-wrap border-t border-gray-200/60 pt-3">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { code: "all", label: "All Statuses" },
                      { code: "active", label: "Active" },
                      { code: "suspended", label: "Suspended" },
                      { code: "draft", label: "Draft" },
                      { code: "pending_approval", label: "Pending Approval" }
                    ].map(st => (
                      <button
                        key={st.code}
                        onClick={() => setStatusFilter(st.code)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          statusFilter === st.code
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Listings Tab Count Info */}
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-semibold text-gray-400">
                  Showing {filteredListings.length} listing(s)
                </span>
                <span className="text-[11px] font-bold text-indigo-600">
                  Total Catalog size: {listings.length}
                </span>
              </div>

              {filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-150 rounded-2xl">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 mb-3">
                    <Building size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Listings Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Try adjusting your search criteria or resetting lists.</p>
                </div>
              ) : (
                <div className="border border-gray-150 rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 border-b border-gray-150 font-semibold">
                        <th className="p-4 font-bold">Listing Name</th>
                        <th className="p-4 font-bold">Category</th>
                        <th className="p-4 font-bold">Vendor Profile</th>
                        <th className="p-4 font-bold">Location</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Service Details</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredListings.map(listing => (
                        <tr 
                          key={listing.id} 
                          className="hover:bg-slate-50/60 border-l-2 border-l-transparent hover:border-l-indigo-600 text-gray-700 transition-all duration-150"
                        >
                          <td className="p-4 font-bold text-slate-900 text-sm">
                            {listing.name}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md capitalize">
                              {listing.service_type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-800 font-semibold">
                            {listing.vendor_business_name}
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-800 font-medium">{listing.city}</span>
                            <span className="text-[10px] text-slate-400 block">{listing.address || listing.state}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md capitalize ${
                              listing.status === "active"
                                ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                                : listing.status === "draft"
                                ? "text-slate-500 bg-slate-50 border border-slate-150"
                                : "text-amber-600 bg-amber-50 border border-amber-100"
                            }`}>
                              {listing.status}
                            </span>
                          </td>
                          <td className="p-4 max-w-[320px]">
                            {renderDetailBadges(listing.details)}
                          </td>
                          <td className="p-4 text-right">
                            {listing.status === "active" ? (
                              <button
                                onClick={() => handleToggleListingStatus(listing.id, listing.status)}
                                disabled={submitting}
                                className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-55"
                              >
                                <X size={11} /> Suspend / Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleListingStatus(listing.id, listing.status)}
                                disabled={submitting}
                                className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-55"
                              >
                                <Check size={11} /> Approve / Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: INQUIRIES & ANALYTICS */}
          {activeTab === "queries" && (
            <div className="space-y-8">
              
              {/* Filters Panel */}
              <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Filter Inquiries by Venue:</span>
                  <select
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="ml-2 px-3 py-1.5 text-xs bg-white border border-gray-250 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-800 cursor-pointer shadow-sm"
                  >
                    <option value="all">All Venues</option>
                    {venuesList.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] font-bold text-indigo-600">
                  {inquiries.length} Customer inquiry(s) active
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-white">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 mb-3">
                    <MessageSquare size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Inquiries Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">No customer leads have been logged for this venue filter option.</p>
                  {selectedVenueId !== "all" && (
                    <button
                      onClick={() => setSelectedVenueId("all")}
                      className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                    >
                      Clear Selection Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Left columns: Queries List */}
                  <div className="xl:col-span-2 space-y-4">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                      <FileText size={13} /> Detailed Inquiries Queue
                    </h3>
                    
                    <div className="space-y-4">
                      {inquiries.map(inq => (
                        <div key={inq.id} className="p-5 bg-white border border-gray-150 hover:border-indigo-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors" />
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3 pl-1">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                {inq.name}
                              </h4>
                              <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">
                                Venue: {inq.venue_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
                              {new Date(inq.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3 text-[10px] text-slate-600 font-medium pl-1">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wide">Phone</span>
                              <span className="text-slate-900 font-semibold">{inq.phone}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wide">Email</span>
                              <span className="text-slate-900 font-semibold truncate block" title={inq.email}>{inq.email || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wide">Event Date</span>
                              <span className="text-indigo-600 font-bold">{inq.event_date || "Not Specified"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase tracking-wide">Budget / Guests</span>
                              <span className="text-slate-950 font-bold">
                                {inq.budget ? `₹${parseFloat(inq.budget).toLocaleString()}` : "N/A"} / {inq.guest_count ? `${inq.guest_count} guests` : "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-150 text-xs text-slate-700 leading-relaxed italic ml-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 not-italic block mb-1">Message Detail</span>
                            "{inq.message}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column: Day-wise volume analytics chart */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-indigo-600" /> Day-Wise Inquiry Volume
                    </h3>

                    <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-sm space-y-6">
                      
                      {analytics.length > 0 ? (
                        <div>
                          {/* Premium Bar Chart with grid lines */}
                          <div className="h-48 w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-200 flex items-end justify-around gap-2.5 relative overflow-hidden">
                            {/* Gridlines */}
                            <div className="absolute inset-x-0 top-[25%] border-b border-dashed border-slate-200 pointer-events-none" />
                            <div className="absolute inset-x-0 top-[50%] border-b border-dashed border-slate-200 pointer-events-none" />
                            <div className="absolute inset-x-0 top-[75%] border-b border-dashed border-slate-200 pointer-events-none" />
                            
                            {analytics.slice(0, 7).reverse().map((day, idx) => {
                              const maxVal = Math.max(...analytics.map(d => d.count), 1);
                              const heightPct = (day.count / maxVal) * 100;
                              return (
                                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group z-10">
                                  <span className="text-[9px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mb-1 bg-white border border-indigo-150 shadow-md px-1.5 py-0.5 rounded-md">
                                    {day.count}
                                  </span>
                                  <div 
                                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-md group-hover:from-indigo-600 group-hover:to-indigo-700 transition-all duration-300 relative shadow-sm"
                                    style={{ height: `${heightPct * 0.7}%`, minHeight: "6px" }}
                                  >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md" />
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-400 mt-2 truncate w-full text-center">
                                    {new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Metrics List view */}
                          <div className="mt-4 border-t border-gray-150 pt-3 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Metrics List</span>
                            <div className="divide-y divide-gray-100 text-xs">
                              {analytics.map((day, idx) => (
                                <div key={idx} className="py-2.5 flex justify-between items-center">
                                  <span className="font-bold text-slate-700">
                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    day.count > 10
                                      ? "bg-rose-50 text-rose-600 border-rose-100"
                                      : day.count > 5
                                      ? "bg-amber-50 text-amber-600 border-amber-100"
                                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                  }`}>
                                    {day.count} {day.count === 1 ? 'inquiry' : 'inquiries'}
                                    {day.count > 10 && ' 🔥'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 text-xs italic">
                          No analytical details generated for selection.
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: BOOKED VENUES */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              
              {/* Filters Panel */}
              <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Filter Calendar by Venue:</span>
                  <select
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    className="ml-2 px-3 py-1.5 text-xs bg-white border border-gray-250 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-800 cursor-pointer shadow-sm"
                  >
                    <option value="all">All Venues</option>
                    {venuesList.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] font-bold text-indigo-600">
                  {bookings.length} Booking dates locked
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-white">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 mb-3">
                    <Calendar size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Booking Dates Blocked</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">No active reservations correspond to the current selection.</p>
                  {selectedVenueId !== "all" && (
                    <button
                      onClick={() => setSelectedVenueId("all")}
                      className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                    >
                      Clear Selection Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="border border-gray-150 rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 border-b border-gray-150 font-semibold">
                        <th className="p-4 font-bold">Booked Event Date</th>
                        <th className="p-4 font-bold">Venue Blocked</th>
                        <th className="p-4 font-bold">Customer Details</th>
                        <th className="p-4 font-bold">Session Slot</th>
                        <th className="p-4 font-bold">Financial Overview</th>
                        <th className="p-4 font-bold">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map(booking => (
                        <tr 
                          key={booking.id} 
                          className="hover:bg-slate-50/60 border-l-2 border-l-transparent hover:border-l-indigo-600 text-gray-700 transition-all duration-150"
                        >
                          <td className="p-4 font-bold text-indigo-600 text-sm">
                            {new Date(booking.event_date).toLocaleDateString(undefined, { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="p-4 text-slate-900 font-bold">
                            {booking.venue_name}
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-950 font-bold">{booking.customer_name}</span>
                            <span className="text-[10px] text-slate-400 block">{booking.customer_phone}</span>
                            {booking.event_type && (
                              <span className="mt-1 px-2 py-0.5 text-[9px] bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-md inline-block">
                                {booking.event_type}
                              </span>
                            )}
                          </td>
                          <td className="p-4 capitalize font-bold text-slate-700">
                            {booking.session.replace(/_/g, " ")}
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="block text-slate-950 font-extrabold text-sm">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
                              <span className="text-[9px] text-emerald-600 block font-semibold">Paid: ₹{parseFloat(booking.advance_paid).toLocaleString()}</span>
                              {parseFloat(booking.balance_due) > 0 && (
                                <span className="text-[9px] text-rose-500 block font-semibold">Due: ₹{parseFloat(booking.balance_due).toLocaleString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                              booking.status === "confirmed"
                                ? "text-emerald-600 bg-emerald-50 border-emerald-250"
                                : booking.status === "cancelled"
                                ? "text-rose-600 bg-rose-50 border-rose-250"
                                : "text-amber-600 bg-amber-50 border-amber-250"
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* REJECTION MODAL */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-zoom-in">
            <button 
              onClick={() => setRejectionModal({ isOpen: false, profileId: null, reason: "" })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="font-heading font-bold text-lg text-gray-950 flex items-center gap-2">
              <ShieldAlert className="text-rose-500" size={20} /> Reject Vendor Profile
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Please specify the precise reason for rejecting this vendor application. This explanation will be displayed to the vendor on their dashboard queue state.
            </p>

            <div className="mt-4">
              <textarea
                placeholder="Type reason here (e.g. GSTIN mismatch, invalid logo resolution, invalid business registry details)..."
                rows={4}
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-3 text-xs border border-gray-250 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-gray-400 text-gray-850"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRejectionModal({ isOpen: false, profileId: null, reason: "" })}
                className="px-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-sm transition-all disabled:opacity-55"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
