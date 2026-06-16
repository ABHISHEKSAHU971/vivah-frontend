"use client";

import { Star, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

export default function VendorDashboard() {
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
        <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-gray-500 border-b border-gray-100">
                <th className="p-3 font-semibold">Lead Source</th>
                <th className="p-3 font-semibold">Date Requested</th>
                <th className="p-3 font-semibold">Guest Count</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: "Rahul Verma (Bhopal)", date: "Feb 12, 2026", guests: "450 Guests", status: "New Inquiry", badge: "bg-blue-50 text-blue-600" },
                { name: "Priya Sharma (Indore)", date: "Feb 10, 2026", guests: "300 Guests", status: "Contacted", badge: "bg-amber-50 text-amber-600" },
              ].map((lead, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/20 text-gray-700">
                  <td className="p-3 font-medium text-gray-950">{lead.name}</td>
                  <td className="p-3">{lead.date}</td>
                  <td className="p-3">{lead.guests}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${lead.badge}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
