"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCircle2, Inbox } from "lucide-react";
import {
  BookingCard,
  defaultBookings,
  type BookingRequest,
  type BookingStatus,
} from "@/components/vendor/BookingRequests";

type Tab = "pending" | "accepted" | "declined" | "all";

const TABS: { code: Tab; label: string }[] = [
  { code: "pending", label: "Awaiting response" },
  { code: "accepted", label: "Confirmed" },
  { code: "declined", label: "Declined" },
  { code: "all", label: "All" },
];

export default function VendorBookingRequestsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>(defaultBookings);
  const [tab, setTab] = useState<Tab>("pending");

  const handleAccept = (id: number) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "accepted" as BookingStatus, planGenerated: true } : b))
    );
  const handleDecline = (id: number) =>
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "declined" as BookingStatus } : b))
    );

  const counts = useMemo(
    () => ({
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      declined: bookings.filter((b) => b.status === "declined").length,
      all: bookings.length,
    }),
    [bookings]
  );

  const visible = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);
  const totalGuests = bookings
    .filter((b) => b.status === "accepted")
    .reduce((sum, b) => sum + b.guests, 0);

  return (
    <div className="space-y-6 font-body">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="console-card console-card-hover p-4">
          <div className="flex items-start justify-between">
            <span className="console-tile tile-amber"><Bell size={18} /></span>
            {counts.pending > 0 && (
              <span className="console-trend console-trend-down">Needs action</span>
            )}
          </div>
          <p className="console-stat-label mt-3.5">Awaiting Response</p>
          <p className="console-stat-value mt-1">{counts.pending}</p>
          <p className="console-stat-caption mt-1">
            {counts.pending > 0 ? "Reply to keep your response rate high" : "You're all caught up"}
          </p>
        </div>

        <div className="console-card console-card-hover p-4">
          <div className="flex items-start justify-between">
            <span className="console-tile tile-emerald"><CheckCircle2 size={18} /></span>
          </div>
          <p className="console-stat-label mt-3.5">Confirmed</p>
          <p className="console-stat-value mt-1">{counts.accepted}</p>
          <p className="console-stat-caption mt-1">
            {totalGuests > 0 ? `${totalGuests.toLocaleString("en-IN")} guests covered` : "No confirmed events yet"}
          </p>
        </div>

        <div className="console-card console-card-hover p-4">
          <div className="flex items-start justify-between">
            <span className="console-tile tile-indigo"><Inbox size={18} /></span>
          </div>
          <p className="console-stat-label mt-3.5">Total Requests</p>
          <p className="console-stat-value mt-1">{counts.all}</p>
          <p className="console-stat-caption mt-1">Across every event type</p>
        </div>
      </div>

      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg font-medium">
        ⚡ Booking requests API coming in Phase 2 — showing sample data for now.
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setTab(code)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
              tab === code
                ? "bg-[#101828] text-white border-[#101828] shadow-sm"
                : "bg-white text-[#667085] border-[#EAECF0] hover:text-[#101828] hover:shadow-sm"
            }`}
          >
            {label}
            <span className={`ml-1.5 ${tab === code ? "text-white/60" : "text-[#98A2B3]"}`}>
              {counts[code]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="console-card p-14 text-center">
          <Inbox size={32} className="mx-auto text-[#D0D5DD] mb-3" />
          <h3 className="text-sm font-semibold text-[#101828]">Nothing here right now</h3>
          <p className="text-xs text-[#98A2B3] mt-1 max-w-sm mx-auto">
            {tab === "pending"
              ? "You've responded to every request. New ones will land here."
              : "No requests in this state yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((b) => (
            <BookingCard key={b.id} booking={b} onAccept={handleAccept} onDecline={handleDecline} />
          ))}
        </div>
      )}
    </div>
  );
}
