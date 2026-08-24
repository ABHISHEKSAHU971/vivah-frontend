"use client";

/**
 * Booking requests — shared by the /vendor/bookings page.
 * Extracted out of the Vendor Profile page so requests have their own
 * destination in the sidebar instead of being buried in the profile.
 *
 * NOTE: still backed by sample data; Phase 2 swaps `defaultBookings` for the API.
 */

import { useState } from "react";
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Zap,
  Plus,
  Trash2,
  Check,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────
export type BookingStatus = "pending" | "accepted" | "declined";
export type TaskStatus = "pending" | "done";

export interface BookingRequest {
  id: number;
  customerName: string;
  city: string;
  eventDate: string;
  guests: number;
  eventType: string;
  requestedAt: string;
  status: BookingStatus;
  planGenerated: boolean;
}

export interface PlanTask {
  id: number;
  label: string;
  status: TaskStatus;
  timing: string;
  category: "setup" | "ops" | "wrap";
}

// ─── Mock Bookings (Phase 2 will replace with real API) ───────────────
export const defaultBookings: BookingRequest[] = [
  {
    id: 1,
    customerName: "Rahul Verma",
    city: "Bhopal",
    eventDate: "Feb 28, 2026",
    guests: 450,
    eventType: "Wedding Reception",
    requestedAt: "2 hours ago",
    status: "pending",
    planGenerated: false,
  },
  {
    id: 2,
    customerName: "Priya Sharma",
    city: "Indore",
    eventDate: "Mar 05, 2026",
    guests: 300,
    eventType: "Engagement Ceremony",
    requestedAt: "5 hours ago",
    status: "pending",
    planGenerated: false,
  },
  {
    id: 3,
    customerName: "Ankit Joshi",
    city: "Bhopal",
    eventDate: "Mar 15, 2026",
    guests: 600,
    eventType: "Full Wedding Ceremony",
    requestedAt: "Yesterday",
    status: "accepted",
    planGenerated: true,
  },
];

export function generatePlan(booking: BookingRequest): PlanTask[] {
  return [
    { id: 1, label: "Confirm guest count & seating layout", status: "pending", timing: "7 days before", category: "setup" },
    { id: 2, label: `Brief catering team on ${booking.guests} pax requirement`, status: "pending", timing: "5 days before", category: "setup" },
    { id: 3, label: "Venue deep cleaning & maintenance check", status: "pending", timing: "3 days before", category: "setup" },
    { id: 4, label: "Stage & mandap installation", status: "pending", timing: "2 days before", category: "setup" },
    { id: 5, label: "Sound system & AV setup + test", status: "pending", timing: "1 day before", category: "setup" },
    { id: 6, label: "Floral & decor delivery receipt", status: "pending", timing: "1 day before", category: "setup" },
    { id: 7, label: "Staff briefing & duty allocation", status: "pending", timing: "Event morning", category: "ops" },
    { id: 8, label: "Guest entry management & valet", status: "pending", timing: "Event day", category: "ops" },
    { id: 9, label: "Catering counter launch & monitoring", status: "pending", timing: "Event day", category: "ops" },
    { id: 10, label: "Photography/videography coordination", status: "pending", timing: "Event day", category: "ops" },
    { id: 11, label: "Real-time feedback from client", status: "pending", timing: "Mid-event", category: "ops" },
    { id: 12, label: "Event wrap-up & venue handover", status: "pending", timing: "Post event", category: "wrap" },
    { id: 13, label: "Send invoice & collect balance payment", status: "pending", timing: "Next day", category: "wrap" },
    { id: 14, label: "Follow up for review & rating", status: "pending", timing: "3 days after", category: "wrap" },
  ];
}

export function PlannerSection({ booking, onClose }: { booking: BookingRequest; onClose: () => void }) {
  const [tasks, setTasks] = useState<PlanTask[]>(() => generatePlan(booking));
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "setup" | "ops" | "wrap">("all");

  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t)));
  const remove = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), label: newTask.trim(), status: "pending", timing: "Custom", category: "ops" },
    ]);
    setNewTask("");
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.category === filter);
  const done = tasks.filter((t) => t.status === "done").length;
  const catColors: Record<string, string> = {
    setup: "bg-blue-50 text-blue-600 border-blue-100",
    ops: "bg-amber-50 text-amber-600 border-amber-100",
    wrap: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-gold/20 overflow-hidden shadow-2xl">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gold/20 flex items-center justify-center">
            <Zap size={14} className="text-gold" />
          </div>
          <div>
            <h4 className="text-white text-sm font-bold">Event Plan — {booking.customerName}</h4>
            <p className="text-slate-400 text-[10px]">{booking.eventType} · {booking.eventDate} · {booking.guests} guests</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Progress</p>
            <p className="text-gold text-sm font-bold">{done}/{tasks.length}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
      <div className="px-5 py-2 bg-slate-900/50">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(done / tasks.length) * 100}%`, background: "linear-gradient(90deg, #C9A440, #D4B96A)" }} />
        </div>
      </div>
      <div className="px-5 pt-3 flex gap-2">
        {(["all", "setup", "ops", "wrap"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === f ? "bg-gold text-black" : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
            }`}>
            {f === "all" ? "All Tasks" : f === "setup" ? "⚙️ Setup" : f === "ops" ? "⚡ Operations" : "🔚 Wrap-up"}
          </button>
        ))}
      </div>
      <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
        {filtered.map((task) => (
          <div key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              task.status === "done" ? "bg-white/5 border-white/5 opacity-60" : "bg-white/8 border-white/10 hover:border-gold/30"
            }`}>
            <button onClick={() => toggle(task.id)}
              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                task.status === "done" ? "bg-gold border-gold" : "border-slate-600 hover:border-gold"
              }`}>
              {task.status === "done" && <Check size={10} className="text-black" />}
            </button>
            <div className="flex-grow min-w-0">
              <p className={`text-xs font-medium leading-tight ${task.status === "done" ? "line-through text-slate-500" : "text-white"}`}>
                {task.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock size={9} /> {task.timing}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${catColors[task.category]}`}>
                  {task.category}
                </span>
              </p>
            </div>
            <button onClick={() => remove(task.id)} className="shrink-0 text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-1 border-t border-white/10 mt-1">
        <div className="flex gap-2 mt-3">
          <input type="text" value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a custom task…"
            className="flex-grow bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50" />
          <button onClick={addTask} className="btn-gold px-4 py-2 rounded-lg text-xs shrink-0">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingCard({ booking, onAccept, onDecline }: {
  booking: BookingRequest;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}) {
  const [planOpen, setPlanOpen] = useState(booking.planGenerated);
  const statusStyle: Record<BookingStatus, string> = {
    pending: "bg-blue-50 text-blue-600 border-blue-100",
    accepted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    declined: "bg-red-50 text-red-500 border-red-100",
  };
  const statusLabel: Record<BookingStatus, string> = {
    pending: "⏳ Awaiting Response",
    accepted: "✅ Confirmed",
    declined: "❌ Declined",
  };

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      booking.status === "declined" ? "opacity-50 grayscale" : "shadow-sm hover:shadow-md"
    }`}
      style={{
        borderColor: booking.status === "accepted" ? "rgba(16,185,129,0.3)" : booking.status === "declined" ? "rgba(239,68,68,0.2)" : "rgba(201,164,64,0.2)",
        background: booking.status === "accepted" ? "rgba(16,185,129,0.03)" : "white",
      }}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #C9A440, #0A1628)" }}>
              {booking.customerName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{booking.customerName}</h4>
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <MapPin size={9} /> {booking.city} · <Clock size={9} className="ml-0.5" /> {booking.requestedAt}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusStyle[booking.status]}`}>
            {statusLabel[booking.status]}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            <Calendar size={10} /> {booking.eventDate}
          </span>
          <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            <Users size={10} /> {booking.guests} guests
          </span>
          <span className="flex items-center gap-1 bg-gold/10 border border-gold/20 text-amber-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
            🎊 {booking.eventType}
          </span>
        </div>
        {booking.status === "pending" && (
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => onAccept(booking.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
              <CheckCircle2 size={13} /> Accept
            </button>
            <button onClick={() => onDecline(booking.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all">
              <XCircle size={13} /> Decline
            </button>
            <div className="flex-grow" />
            <button onClick={() => setPlanOpen((p) => !p)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #C9A440, #D4B96A)" }}>
              <Zap size={13} /> Generate Event Plan
              {planOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        )}
        {booking.status === "accepted" && (
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setPlanOpen((p) => !p)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #C9A440, #D4B96A)" }}>
              <Zap size={13} /> {planOpen ? "Hide" : "View"} Event Plan
              {planOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        )}
      </div>
      {planOpen && (
        <div className="px-4 pb-4">
          <PlannerSection booking={booking} onClose={() => setPlanOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
