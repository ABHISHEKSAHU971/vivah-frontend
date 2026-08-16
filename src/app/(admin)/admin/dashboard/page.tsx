"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Briefcase,
  Utensils,
  Palette
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
  catering_package?: number | null;
  catering_package_name?: string | null;
  decoration_package?: number | null;
  decoration_package_name?: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface InquiryAnalytics {
  date: string;
  count: number;
}

interface GroupedInquiry {
  group_key: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  event_date: string | null;
  first_created_at: string;
  inquiry_count: number;
  statuses: string[];
  overall_status: string;
  inquiries: Inquiry[];
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"approvals" | "listings" | "queries" | "bookings">("approvals");
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Data states
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [groupedInquiries, setGroupedInquiries] = useState<GroupedInquiry[]>([]);
  const [analytics, setAnalytics] = useState<InquiryAnalytics[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Customer Full Details state
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);
  const [customerInquiries, setCustomerInquiries] = useState<Inquiry[]>([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);

  // Confirm Booking Modal state
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

  // Edit Inquiry Modal state
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

      const groupedRes = await api.get(`/venues/admin/inquiries/grouped/${inquiryQuery}`);
      setGroupedInquiries(groupedRes.data?.data?.grouped_inquiries || []);

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


  // Fetch catalogs on mount
  useEffect(() => {
    api.get("/venues/venues/").then((res) => {
      setAllVenues(res.data?.results || res.data?.data?.results || res.data?.data || res.data || []);
    }).catch(() => {});

    api.get("/catering/catering-packages/").then((res) => {
      setAllCateringPkgs(res.data?.results || res.data?.data?.results || res.data?.data || res.data || []);
    }).catch(() => {});

    api.get("/decorations/decoration-packages/").then((res) => {
      setAllDecorPkgs(res.data?.results || res.data?.data?.results || res.data?.data || res.data || []);
    }).catch(() => {});
  }, []);

  // Re-fetch venue-specific endpoints when venue ID filter changes
  useEffect(() => {
    fetchData();
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

  const handleViewCustomerDetails = (phone: string) => {
    router.push(`/admin/inquiries/customer/${encodeURIComponent(phone)}`);
  };

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

      triggerToast(res.data?.message || "🎉 Booking confirmed successfully!");
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

      // Update state
      setInquiries(prev => prev.map(i => i.id === confirmModal.inquiry!.id ? { ...i, status: "confirmed" } : i));
      if (selectedCustomerPhone) {
        setCustomerInquiries(prev => prev.map(i => i.id === confirmModal.inquiry!.id ? { ...i, status: "confirmed" } : i));
      }
      fetchData(); // Sync full dataset
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

      triggerToast("Inquiry updated successfully!");
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

      const updated = res.data?.data;
      if (updated) {
        setInquiries(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
        if (selectedCustomerPhone) {
          setCustomerInquiries(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.detail || "Failed to update inquiry.");
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
                  
                  {/* Left columns: Queries List & Customer Full Details */}
                  <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                        <FileText size={13} /> Customer Inquiries List
                      </h3>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Click "View Full Details" to inspect or confirm bookings
                      </span>
                    </div>

                    {/* Customer Inquiries Table */}
                    <div className="border border-gray-150 rounded-xl overflow-x-auto shadow-sm bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-gray-500 border-b border-gray-150 font-semibold">
                            <th className="p-3 font-bold">#</th>
                            <th className="p-3 font-bold">Customer Name</th>
                            <th className="p-3 font-bold">Location</th>
                            <th className="p-3 font-bold">Phone Number</th>
                            <th className="p-3 font-bold">Booking Date</th>
                            <th className="p-3 font-bold">Requests</th>
                            <th className="p-3 font-bold">Status</th>
                            <th className="p-3 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupedInquiries.map((grp, index) => {
                            const isSelected = selectedCustomerPhone === grp.phone;
                            return (
                              <tr
                                key={grp.group_key}
                                className={`hover:bg-indigo-50/40 transition-colors ${
                                  isSelected ? "bg-indigo-50/60 font-semibold" : ""
                                }`}
                              >
                                <td className="p-3 text-slate-400 font-medium">{index + 1}</td>
                                <td className="p-3 font-bold text-slate-900">{grp.name}</td>
                                <td className="p-3 text-slate-600 capitalize">{grp.location || "N/A"}</td>
                                <td className="p-3 font-medium text-slate-800">{grp.phone}</td>
                                <td className="p-3 font-semibold text-indigo-600">
                                  {grp.event_date ? new Date(grp.event_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Not Set"}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {grp.inquiry_count} {grp.inquiry_count === 1 ? 'Inquiry' : 'Inquiries'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md capitalize ${
                                    grp.overall_status === "confirmed"
                                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                      : grp.overall_status === "closed"
                                      ? "text-slate-600 bg-slate-100 border border-slate-200"
                                      : "text-amber-700 bg-amber-50 border border-amber-200"
                                  }`}>
                                    {grp.overall_status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleViewCustomerDetails(grp.phone)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all inline-flex items-center gap-1 ${
                                      isSelected
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-slate-100 hover:bg-indigo-50 text-indigo-600 border border-indigo-100"
                                    }`}
                                  >
                                    {isSelected ? "Hide Details" : "View Full Details"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* EXPANDED CUSTOMER FULL DETAILS PANEL */}
                    {selectedCustomerPhone && (
                      <div className="border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 rounded-2xl shadow-md space-y-6 animate-fade-in relative">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-indigo-600 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                              Customer Inquiry Details
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                              {customerInquiries[0]?.name || "Customer"} — Phone: {selectedCustomerPhone}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Showing all requested services (Venue, Catering, Decoration) for this phone number.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCustomerPhone(null);
                              setCustomerInquiries([]);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {loadingCustomerDetails ? (
                          <div className="py-8 text-center text-xs text-indigo-600 font-semibold flex items-center justify-center gap-2">
                            <RefreshCw size={16} className="animate-spin" /> Fetching complete customer history...
                          </div>
                        ) : customerInquiries.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-4">No registered inquiries found for this customer.</p>
                        ) : (
                          <div className="space-y-4">
                            {customerInquiries.map((inq) => (
                              <div
                                key={inq.id}
                                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative"
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">Inquiry #{inq.id}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md capitalize ${
                                      inq.status === "confirmed"
                                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                        : "text-amber-700 bg-amber-50 border border-amber-200"
                                    }`}>
                                      {inq.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
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
                                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg transition-all"
                                    >
                                      Edit Details
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
                                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5"
                                      >
                                        <Check size={14} /> Confirm Booking
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block">🏛️ Venue Selection</span>
                                    <p className="font-bold text-slate-900">{inq.venue_name || "No Venue Selected"}</p>
                                    <p className="text-slate-500 text-[11px]">Location: {inq.location || "Not specified"}</p>
                                  </div>

                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block">🍽️ Catering Package</span>
                                    <p className="font-bold text-slate-900">{inq.catering_package_name || "None / Standard Venue Catering"}</p>
                                    <p className="text-slate-500 text-[11px]">Guests: {inq.guest_count || "Not specified"}</p>
                                  </div>

                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block">🎨 Decoration Package</span>
                                    <p className="font-bold text-slate-900">{inq.decoration_package_name || "None / Standard Venue Decor"}</p>
                                    <p className="text-slate-500 text-[11px]">Budget: {inq.budget ? `₹${parseFloat(inq.budget).toLocaleString()}` : "N/A"}</p>
                                  </div>
                                </div>

                                {inq.message && (
                                  <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-150 text-slate-700 italic">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 not-italic block mb-0.5">Customer Special Requests:</span>
                                    "{inq.message}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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

      {/* CONFIRM BOOKING MODAL */}
      {confirmModal.isOpen && confirmModal.inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-zoom-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false, inquiry: null }))}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="font-heading font-bold text-lg text-gray-950 flex items-center gap-2">
              <Check className="text-emerald-600" size={20} /> Confirm Venue Booking
            </h3>
            <p className="text-xs text-gray-500 mt-1">
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
                  placeholder="Payment reference, special instructions, custom verbal agreements..."
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
                className="px-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-xl transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-zoom-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditModal(prev => ({ ...prev, isOpen: false, inquiry: null }))}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="font-heading font-bold text-lg text-gray-950 flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={20} /> Modify Customer Inquiry
            </h3>
            <p className="text-xs text-gray-500 mt-1">
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
                className="px-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-xl transition-all"
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
