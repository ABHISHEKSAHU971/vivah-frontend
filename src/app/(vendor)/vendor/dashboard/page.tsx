"use client";

import { useEffect, useState } from "react";
import { Star, TrendingUp, Users, DollarSign, Calendar, Loader2, AlertCircle, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  location: string;
  event_date: string | null;
  event_type: string | null;
  guest_count: number | null;
  message: string;
  status: string;
  created_at: string;
}

export default function VendorDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/venues/venue-inquiries/")
      .then((res) => {
        // Handle DRF success response structure or paginated standard results
        const data = res.data.results || res.data.data?.results || res.data.data || res.data || [];
        setLeads(data);
      })
      .catch((err) => {
        console.error("[fetch dashboard leads error]", err);
        const serverMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error;
        setError(serverMsg || "Could not retrieve incoming celebration leads.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Partner Console Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Review bookings, performance stats, and active leads</p>
      </div>

      <hr className="border-gray-100" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", val: "2", icon: Star, color: "text-amber-500 bg-amber-50" },
          { label: "Total Bookings", val: "142", icon: Calendar, color: "text-blue-500 bg-blue-50" },
          { label: "Total Capacity", val: "800", icon: Users, color: "text-emerald-500 bg-emerald-50" },
          { label: "Est. Earnings", val: "₹12.4L", icon: DollarSign, color: "text-purple-500 bg-purple-50" },
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

      {/* Leads Table */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-lg text-gray-900 flex items-center gap-1.5">
          <TrendingUp size={16} className="text-gold" /> Incoming Celebration Leads
        </h3>

        {loading ? (
          <div className="border border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 bg-white shadow-sm">
            <Loader2 size={24} className="animate-spin text-gold" />
            <p className="text-xs">Loading celebration inquiries...</p>
          </div>
        ) : error ? (
          <div className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold">Error loading inquiries</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="border border-gray-150 border-dashed rounded-2xl p-12 text-center bg-zinc-50/30">
            <TrendingUp size={36} className="mx-auto text-zinc-300 mb-2" />
            <h4 className="text-sm font-semibold text-gray-900">No leads registered yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">When customers submit bookings or customize catering packages on your listings, they will show up here.</p>
          </div>
        ) : (
          <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-gray-500 border-b border-gray-100">
                  <th className="p-3 font-semibold">Lead Contact</th>
                  <th className="p-3 font-semibold">Date Received</th>
                  <th className="p-3 font-semibold">Guest Size</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => {
                  const isExpanded = expandedLeadId === lead.id;
                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50/20 text-gray-700">
                      <td className="p-3 font-medium text-gray-950">
                        <div>
                          <span>{lead.name}</span>
                          {lead.location && (
                            <span className="text-[10px] text-gray-400 font-normal ml-1.5 capitalize">({lead.location})</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {new Date(lead.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        {lead.guest_count ? `${lead.guest_count} Guests` : "N/A"}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          lead.status === "pending"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : lead.status === "responded"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-zinc-50 text-zinc-600 border border-zinc-150"
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          className="text-xs font-semibold text-gold hover:text-black transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{isExpanded ? "Close" : "View"}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded Lead Info Panel */}
      {expandedLeadId !== null && (() => {
        const lead = leads.find((l) => l.id === expandedLeadId);
        if (!lead) return null;
        return (
          <div className="border border-gold/20 rounded-2xl p-5 bg-gold/5 space-y-4 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Celebration Lead Details</h4>
                <p className="text-[10px] text-gray-400">Received on {new Date(lead.created_at).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedLeadId(null)}
                className="text-gray-400 hover:text-black text-xs font-bold"
              >
                Close Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-t border-gold/10 pt-4">
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-gold uppercase tracking-wider">Contact Details</p>
                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" /> {lead.phone}
                  </p>
                  {lead.email && (
                    <p className="text-gray-600 flex items-center gap-1.5">
                      <Mail size={13} className="text-gray-400" /> {lead.email}
                    </p>
                  )}
                  {lead.location && <p className="text-gray-500 font-medium">Preferred Area: {lead.location}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-bold text-gold uppercase tracking-wider">Event Specifications</p>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    Target Date: <span className="font-bold">{lead.event_date ? new Date(lead.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Flexible / Not Specified"}</span>
                  </p>
                  {lead.event_type && <p className="text-gray-600">Event Category: <span className="font-semibold capitalize">{lead.event_type}</span></p>}
                  {lead.guest_count && <p className="text-gray-600">Guest Count Limit: <span className="font-semibold">{lead.guest_count}</span></p>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-bold text-gold uppercase tracking-wider">Customer Inquiry Message</p>
                <p className="text-gray-700 bg-white/70 p-3 rounded-xl border border-gold/5 italic leading-relaxed">
                  "{lead.message || "No message provided."}"
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
