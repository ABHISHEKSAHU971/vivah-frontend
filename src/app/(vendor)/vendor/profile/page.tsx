"use client";

import { useState } from "react";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Bell,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Zap,
  Plus,
  Trash2,
  Check,
  Pencil,
  Save,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────
type BookingStatus = "pending" | "accepted" | "declined";
type TaskStatus = "pending" | "done";

interface BookingRequest {
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

interface PlanTask {
  id: number;
  label: string;
  status: TaskStatus;
  timing: string;
  category: "setup" | "ops" | "wrap";
}

// ─── Mock Data ─────────────────────────────────────────────────────────
const VENDOR_TYPES = ["Venue", "Catering", "Decor", "DJ & Sound", "Photography"];

const defaultBookings: BookingRequest[] = [
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

function generatePlan(booking: BookingRequest): PlanTask[] {
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

// ─── Sub-components ─────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={13} />
      </div>
      <div>
        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{label}</p>
        <p className="text-white text-xs font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function CategoryBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    Venue: "🏛️",
    Catering: "🍽️",
    Decor: "🌸",
    "DJ & Sound": "🎵",
    Photography: "📷",
  };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{ background: "rgba(201,164,64,0.18)", border: "1px solid rgba(201,164,64,0.4)", color: "#C9A440" }}>
      <span>{icons[type] ?? "🏷️"}</span>
      {type} Partner
    </span>
  );
}

function PlannerSection({ booking, onClose }: { booking: BookingRequest; onClose: () => void }) {
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
      {/* Planner header */}
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

      {/* Progress bar */}
      <div className="px-5 py-2 bg-slate-900/50">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(done / tasks.length) * 100}%`,
              background: "linear-gradient(90deg, #C9A440, #D4B96A)",
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-5 pt-3 flex gap-2">
        {(["all", "setup", "ops", "wrap"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-gold text-black"
                : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            {f === "all" ? "All Tasks" : f === "setup" ? "⚙️ Setup" : f === "ops" ? "⚡ Operations" : "🔚 Wrap-up"}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              task.status === "done"
                ? "bg-white/5 border-white/5 opacity-60"
                : "bg-white/8 border-white/10 hover:border-gold/30"
            }`}
          >
            <button
              onClick={() => toggle(task.id)}
              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                task.status === "done"
                  ? "bg-gold border-gold"
                  : "border-slate-600 hover:border-gold"
              }`}
            >
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
            <button
              onClick={() => remove(task.id)}
              className="shrink-0 text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="px-5 pb-5 pt-1 border-t border-white/10 mt-1">
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a custom task…"
            className="flex-grow bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold/50"
          />
          <button
            onClick={addTask}
            className="btn-gold px-4 py-2 rounded-lg text-xs shrink-0"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onAccept,
  onDecline,
}: {
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
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        booking.status === "declined" ? "opacity-50 grayscale" : "shadow-sm hover:shadow-md"
      }`}
      style={{
        borderColor: booking.status === "accepted" ? "rgba(16,185,129,0.3)" : booking.status === "declined" ? "rgba(239,68,68,0.2)" : "rgba(201,164,64,0.2)",
        background: booking.status === "accepted" ? "rgba(16,185,129,0.03)" : "white",
      }}
    >
      <div className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
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

        {/* Event details pills */}
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

        {/* Actions */}
        {booking.status === "pending" && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onAccept(booking.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
            >
              <CheckCircle2 size={13} /> Accept
            </button>
            <button
              onClick={() => onDecline(booking.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
            >
              <XCircle size={13} /> Decline
            </button>
            <div className="flex-grow" />
            <button
              onClick={() => setPlanOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #C9A440, #D4B96A)" }}
            >
              <Zap size={13} /> Generate Event Plan
              {planOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        )}

        {booking.status === "accepted" && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setPlanOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #C9A440, #D4B96A)" }}
            >
              <Zap size={13} /> {planOpen ? "Hide" : "View"} Event Plan
              {planOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        )}
      </div>

      {/* Planner panel */}
      {planOpen && (
        <div className="px-4 pb-4">
          <PlannerSection booking={booking} onClose={() => setPlanOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

export default function VendorProfile() {
  const [vendorType, setVendorType] = useState("Venue");
  const [editMode, setEditMode] = useState(false);
  const [businessName, setBusinessName] = useState("Royal Gardens & Banquets");
  const [gstin, setGstin] = useState("23AAAAA1111A1Z1");
  const [city, setCity] = useState("Bhopal");
  const [phone, setPhone] = useState("+91 98765 99999");
  const [email, setEmail] = useState("contact@royalgardens.in");
  const [bookings, setBookings] = useState<BookingRequest[]>(defaultBookings);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [notifExpanded, setNotifExpanded] = useState(true);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const handleAccept = (id: number) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "accepted", planGenerated: true } : b)));

  const handleDecline = (id: number) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "declined" } : b)));

  return (
    <div className="space-y-6 font-body">

      {/* ── Premium Header Card ───────────────────── */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #050D1A 0%, #0A1628 50%, #0F1E35 100%)" }}
      >
        {/* Subtle decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A440, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A440, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5">

            {/* Avatar */}
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 font-bold text-2xl text-gold border"
              style={{ background: "rgba(201,164,64,0.12)", borderColor: "rgba(201,164,64,0.3)" }}
            >
              {businessName.charAt(0)}
            </div>

            {/* Identity block */}
            <div className="flex-grow space-y-2.5">
              {/* Vendor type badge — clickable dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowTypeDropdown((p) => !p)}
                  className="flex items-center gap-1.5"
                >
                  <CategoryBadge type={vendorType} />
                  <ChevronDown size={12} className="text-gold" />
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-10 min-w-[160px]">
                    {VENDOR_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setVendorType(t); setShowTypeDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-slate-700 ${t === vendorType ? "text-gold" : "text-slate-300"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Business name */}
              <h1 className="text-2xl md:text-3xl font-heading font-semibold text-white leading-tight">
                {businessName}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <MapPin size={10} /> {city}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <ShieldCheck size={10} className="text-emerald-400" /> GSTIN Verified
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Award size={10} className="text-gold" /> Active Since 2024
                </span>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <StatPill icon={Star} label="Avg Rating" value="4.8 / 5.0" color="bg-amber-500/20 text-amber-400" />
                <StatPill icon={Calendar} label="Bookings" value="142 Events" color="bg-blue-500/20 text-blue-400" />
                <StatPill icon={Users} label="Guests Served" value="64,000+" color="bg-emerald-500/20 text-emerald-400" />
                <StatPill icon={TrendingUp} label="Est. Earnings" value="₹12.4L" color="bg-purple-500/20 text-purple-400" />
              </div>
            </div>

            {/* Edit toggle */}
            <button
              onClick={() => setEditMode((p) => !p)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                editMode
                  ? "bg-gold text-black border-gold"
                  : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10"
              }`}
            >
              {editMode ? <Save size={13} /> : <Pencil size={13} />}
              {editMode ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Business Details Grid ─────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-gray-900 text-base flex items-center gap-2">
            <Store size={16} className="text-gold" /> Business Details
          </h2>
          {editMode && (
            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <Pencil size={9} /> Editing
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Business Name", value: businessName, onChange: setBusinessName, icon: Store },
            { label: "GSTIN / Registration Code", value: gstin, onChange: setGstin, icon: ShieldCheck },
            { label: "Primary City", value: city, onChange: setCity, icon: MapPin },
            { label: "Support Phone", value: phone, onChange: setPhone, icon: Phone },
            { label: "Contact Email", value: email, onChange: setEmail, icon: Mail },
          ].map(({ label, value, onChange, icon: Icon }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 block">
                <Icon size={10} className="text-gold" /> {label}
              </label>
              <input
                type="text"
                value={value}
                disabled={!editMode}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
                  editMode
                    ? "bg-white border-gold/40 text-gray-900 focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
                    : "bg-zinc-50 border-gray-100 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Booking Request Notifications ─────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Section header */}
        <button
          onClick={() => setNotifExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={18} className="text-gray-700" />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <h2 className="font-heading font-semibold text-gray-900 text-base">Booking Requests</h2>
              <p className="text-[11px] text-gray-400">
                {pendingCount > 0
                  ? `${pendingCount} new request${pendingCount > 1 ? "s" : ""} awaiting your response`
                  : "All requests reviewed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold border border-slate-200">
              {bookings.length} total
            </span>
            {notifExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        {notifExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-gray-50 pt-4">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} onAccept={handleAccept} onDecline={handleDecline} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
