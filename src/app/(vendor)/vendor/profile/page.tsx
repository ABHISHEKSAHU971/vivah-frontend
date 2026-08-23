"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { vendorApi, type VendorProfileData } from "@/lib/authApi";
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
  Upload,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

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

export default function VendorProfile() {
  const router = useRouter();
  const setVendorProfile = useStore((s) => s.setVendorProfile);
  const storeProfile = useStore((s) => s.vendorProfile);
  const token = useStore((s) => s.token);

  const [profile, setProfile] = useState<VendorProfileData | null>(storeProfile);
  const [loadError, setLoadError] = useState("");
  const [pageLoading, setPageLoading] = useState(!storeProfile);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VendorProfileData>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Logo upload
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    if (!token) {
      router.push("/vendor/login");
      return;
    }
    if (storeProfile) {
      setProfile(storeProfile);
      setPageLoading(false);
      return;
    }
    vendorApi.getProfile()
      .then((p) => {
        setProfile(p);
        setVendorProfile(p);
      })
      .catch(() => {
        setLoadError("Could not load your profile. Please refresh or try logging in again.");
      })
      .finally(() => setPageLoading(false));
  }, [token, storeProfile, setVendorProfile, router]);

  const startEdit = () => {
    if (!profile) return;
    setEditForm({
      full_name: profile.full_name,
      email: profile.email ?? "",
      business_name: profile.business_name,
      description: profile.description,
      city: profile.city,
      state: profile.state,
      address: profile.address,
      gstin: profile.gstin,
    });
    setEditMode(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await vendorApi.updateProfile({
        full_name: editForm.full_name,
        email: editForm.email || undefined,
        business_name: editForm.business_name,
        description: editForm.description,
        city: editForm.city,
        state: editForm.state,
        address: editForm.address,
        gstin: editForm.gstin,
      });
      setProfile(updated);
      setVendorProfile(updated);
      setEditMode(false);
      setSaveMsg("Profile saved successfully.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be under 2 MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Only JPEG, PNG, or WebP files allowed.");
      return;
    }
    setLogoError("");
    setLogoUploading(true);
    try {
      const res = await vendorApi.uploadLogo(file);
      if (profile) {
        const updated = { ...profile, logo: res.logo_url };
        setProfile(updated);
        setVendorProfile(updated);
      }
    } catch {
      setLogoError("Logo upload failed. Please try again.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-gold" />
          <p className="text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-sm text-gray-600">{loadError || "Profile not found."}</p>
          <button onClick={() => window.location.reload()}
            className="text-xs text-gold underline">Retry</button>
        </div>
      </div>
    );
  }

  const logoUrl = profile.logo
    ? profile.logo.startsWith("http")
      ? profile.logo
      : `http://localhost:8000${profile.logo}`
    : null;

  return (
    <div className="space-y-6 font-body">

      {/* ── Premium Header Card ───────────────────── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #050D1A 0%, #0A1628 50%, #0F1E35 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A440, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A440, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5">

            {/* Logo / Avatar */}
            <div className="relative shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Business Logo"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border"
                  style={{ borderColor: "rgba(201,164,64,0.3)" }} />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 font-bold text-2xl text-gold border"
                  style={{ background: "rgba(201,164,64,0.12)", borderColor: "rgba(201,164,64,0.3)" }}>
                  {profile.business_name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Upload overlay */}
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                title="Upload logo"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gold text-black flex items-center justify-center border-2 border-slate-900 hover:bg-gold/80 transition-all"
              >
                {logoUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={11} />}
              </button>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={handleLogoChange} />
            </div>

            {/* Identity block */}
            <div className="flex-grow space-y-2.5">
              {/* Approval badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: "rgba(201,164,64,0.18)", border: "1px solid rgba(201,164,64,0.4)", color: "#C9A440" }}
                >
                  {profile.vendor_type} Partner
                </span>
                {profile.is_approved ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                    <ShieldCheck size={9} /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                    <Clock size={9} /> Pending Approval
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-heading font-semibold text-white leading-tight">
                {profile.business_name}
              </h1>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <MapPin size={10} /> {profile.city}, {profile.state}
                </span>
                {profile.gstin && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <ShieldCheck size={10} className="text-emerald-400" /> GSTIN Verified
                    </span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Award size={10} className="text-gold" /> Member since {new Date(profile.created_at).getFullYear()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <StatPill icon={Star} label="Avg Rating" value="4.8 / 5.0" color="bg-amber-500/20 text-amber-400" />
                <StatPill icon={Calendar} label="Bookings" value="142 Events" color="bg-blue-500/20 text-blue-400" />
                <StatPill icon={Users} label="Guests Served" value="64,000+" color="bg-emerald-500/20 text-emerald-400" />
                <StatPill icon={TrendingUp} label="Est. Earnings" value="₹12.4L" color="bg-purple-500/20 text-purple-400" />
              </div>

              {logoError && (
                <p className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {logoError}</p>
              )}
            </div>

            {/* Edit toggle */}
            <button
              onClick={editMode ? handleSave : startEdit}
              disabled={saving}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                editMode
                  ? "bg-gold text-black border-gold"
                  : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10"
              }`}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : editMode ? <Save size={13} /> : <Pencil size={13} />}
              {saving ? "Saving…" : editMode ? "Save Profile" : "Edit Profile"}
            </button>
          </div>

          {/* Rejection notice */}
          {!profile.is_approved && profile.rejection_reason && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">
              <p className="font-semibold flex items-center gap-1.5"><AlertCircle size={12} /> Application Feedback</p>
              <p className="mt-1 text-red-400/80">{profile.rejection_reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Success / error message */}
      {saveMsg && (
        <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${
          saveMsg.includes("failed") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        }`}>
          {saveMsg}
        </div>
      )}

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
            { label: "Business Name", field: "business_name" as const, icon: Store, value: editMode ? editForm.business_name ?? "" : profile.business_name },
            { label: "GSTIN", field: "gstin" as const, icon: ShieldCheck, value: editMode ? editForm.gstin ?? "" : profile.gstin },
            { label: "City", field: "city" as const, icon: MapPin, value: editMode ? editForm.city ?? "" : profile.city },
            { label: "State", field: "state" as const, icon: MapPin, value: editMode ? editForm.state ?? "" : profile.state },
            { label: "Contact Email", field: "email" as const, icon: Mail, value: editMode ? editForm.email ?? "" : profile.email ?? "" },
            { label: "Full Name", field: "full_name" as const, icon: Phone, value: editMode ? editForm.full_name ?? "" : profile.full_name },
          ].map(({ label, field, icon: Icon, value }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 block">
                <Icon size={10} className="text-gold" /> {label}
              </label>
              <input
                type="text"
                value={value}
                disabled={!editMode}
                onChange={(e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
                  editMode
                    ? "bg-white border-gold/40 text-gray-900 focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
                    : "bg-zinc-50 border-gray-100 text-gray-600 cursor-not-allowed"
                }`}
              />
            </div>
          ))}

          {/* Description — full width */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Description</label>
            <textarea
              value={editMode ? editForm.description ?? "" : profile.description}
              disabled={!editMode}
              rows={3}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all resize-none ${
                editMode
                  ? "bg-white border-gold/40 text-gray-900 focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
                  : "bg-zinc-50 border-gray-100 text-gray-600 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Address — full width */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Address</label>
            <input
              type="text"
              value={editMode ? editForm.address ?? "" : profile.address}
              disabled={!editMode}
              onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all ${
                editMode
                  ? "bg-white border-gold/40 text-gray-900 focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
                  : "bg-zinc-50 border-gray-100 text-gray-600 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {editMode && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold btn-gold text-black disabled:opacity-70"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={() => { setEditMode(false); setSaveMsg(""); }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Booking requests now live at /vendor/bookings — linked from the sidebar. */}
      <Link
        href="/vendor/bookings"
        className="console-card console-card-hover flex items-center justify-between gap-4 px-6 py-4 group"
      >
        <div className="flex items-center gap-3">
          <span className="console-tile tile-gold"><Bell size={17} /></span>
          <div className="text-left">
            <h2 className="font-semibold text-[#101828] text-[15px]">Booking Requests</h2>
            <p className="text-[11px] text-[#98A2B3]">
              Review and respond to customer enquiries
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gold inline-flex items-center gap-1">
          Open <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </div>
  );
}
