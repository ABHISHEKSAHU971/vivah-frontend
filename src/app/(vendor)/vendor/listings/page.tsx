"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Store, Camera, Music, Sparkles, Utensils, Flower, Calendar, ArrowRight, MapPin, Eye, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Listing {
  id: number;
  service_type: string;
  name: string;
  description: string;
  city: string;
  state: string;
  status: "draft" | "pending_approval" | "active" | "suspended";
  created_at: string;
}

export default function VendorListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/listings/")
      .then((res) => {
        // Unwrap data envelope
        const data = res.data.data?.listings || res.data.listings || [];
        setListings(data);
      })
      .catch((err) => {
        console.error("Fetch listings error:", err);
        const serverMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error;
        setError(serverMsg || "Could not load your listings. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "venue": return <Store size={16} />;
      case "dj": return <Music size={16} />;
      case "photographer": return <Camera size={16} />;
      case "makeup": return <Sparkles size={16} />;
      case "caterer": return <Utensils size={16} />;
      case "decorator": return <Flower size={16} />;
      case "planner": return <Calendar size={16} />;
      default: return <Store size={16} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "draft": return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
      case "pending_approval": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "suspended": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "draft": return "Draft";
      case "pending_approval": return "Pending Approval";
      case "suspended": return "Suspended";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">My Listings</h1>
          <p className="text-xs text-gray-400 mt-1">Manage and edit your business services and venue profiles</p>
        </div>
        <Link href="/vendor/listings/add" className="btn-gold text-xs rounded-xl flex items-center gap-1.5 shrink-0 hover:shadow-lg transition-all px-4 py-2.5">
          <Plus size={15} /> Add New Listing
        </Link>
      </div>

      <hr className="border-gray-100" />

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-gold" />
          <p className="text-sm">Fetching your catalog...</p>
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-center max-w-sm mx-auto">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6 bg-zinc-50 border border-dashed border-gray-200 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
            <Store size={20} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-gray-900 text-sm">No Listings Found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">You haven&apos;t added any service listings yet. Create one to start receiving bookings!</p>
          </div>
          <Link href="/vendor/listings/add" className="btn-gold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 hover:shadow-md transition-all">
            Add Your First Listing <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-start gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full font-semibold capitalize">
                    {getServiceTypeIcon(item.service_type)} {item.service_type}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-gray-900 text-base leading-tight">{item.name}</h3>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-gold" /> {item.city}, {item.state}
                  </p>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </div>
              <div className="px-5 py-3 bg-zinc-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Added on {new Date(item.created_at).toLocaleDateString()}</span>
                <Link href={`/vendor/listings/${item.id}/edit`} className="text-xs text-gold hover:underline font-semibold flex items-center gap-1 transition-colors">
                  <Eye size={12} /> Edit Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
