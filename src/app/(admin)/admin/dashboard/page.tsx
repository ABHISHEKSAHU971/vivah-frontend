"use client";

import { Check, X, ShieldAlert, Star } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Admin Control Center</h1>
        <p className="text-xs text-gray-400 mt-1">Verify new vendors, manage flagged listings, and platform metrics</p>
      </div>

      <hr className="border-gray-100" />

      {/* Dashboard Tables */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-gray-900 flex items-center gap-1.5">
          <ShieldAlert size={16} className="text-red-500" /> Vendor Approvals Queue
        </h3>

        <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-gray-500 border-b border-gray-100">
                <th className="p-3 font-semibold">Business Name</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">City</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: "Skyline Rooftop", type: "Rooftop Venue", city: "Delhi" },
                { name: "Royal Kitchens", type: "Catering Provider", city: "Bhopal" },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/20 text-gray-700">
                  <td className="p-3 font-medium text-gray-950">{item.name}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3">{item.city}</td>
                  <td className="p-3 text-right space-x-2">
                    <button className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors inline-flex items-center gap-0.5">
                      <Check size={11} /> Approve
                    </button>
                    <button className="px-2.5 py-1 text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors inline-flex items-center gap-0.5">
                      <X size={11} /> Reject
                    </button>
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
