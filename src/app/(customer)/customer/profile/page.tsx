"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle, AlertCircle } from "lucide-react";
import { customerApi, type CustomerProfileData } from "@/lib/authApi";
import { useStore } from "@/store/store";
import { CITIES_BY_STATE, INDIAN_STATES } from "@/lib/indiaLocations";

const ALL_CITIES = Array.from(new Set(Object.values(CITIES_BY_STATE).flat())).sort();

function digitsOnlyPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.slice(-10);
}

export default function CustomerProfile() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setOnboardingField = useStore((s) => s.setOnboardingField);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("Bhopal");
  const [state, setState] = useState("Madhya Pradesh");
  const [budget, setBudget] = useState("500000");
  const [guests, setGuests] = useState("150");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const profile = await customerApi.getProfile();
        if (cancelled) return;
        applyProfile(profile);
      } catch {
        // Fall back to whatever we already have in the auth store.
        if (cancelled) return;
        setPhone(user?.phone || "");
        setFullName(user?.full_name || "");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyProfile = (profile: CustomerProfileData) => {
    setPhone(profile.phone || "");
    setFullName(profile.full_name || "");
    setCity(profile.city || "Bhopal");
    setState(profile.state || "Madhya Pradesh");
    const budgetValue = profile.budget_max ?? profile.budget_min;
    setBudget(budgetValue != null ? String(Math.round(Number(budgetValue))) : "500000");
    setGuests(profile.guest_count != null ? String(profile.guest_count) : "150");
  };

  const handleSave = async () => {
    const name = fullName.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }
    const guestCount = parseInt(guests, 10);
    const budgetNum = parseInt(budget.replace(/\D/g, ""), 10);
    if (!guestCount || guestCount <= 0) {
      setError("Enter a valid guest count.");
      return;
    }
    if (!budgetNum || budgetNum <= 0) {
      setError("Enter a valid wedding budget.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const profile = await customerApi.updateProfile({
        full_name: name,
        city,
        state,
        guest_count: guestCount,
        budget_min: budgetNum,
        budget_max: budgetNum,
      });
      applyProfile(profile);
      if (user) {
        setUser({ ...user, full_name: profile.full_name || name });
      }
      setOnboardingField("phone", digitsOnlyPhone(profile.phone || phone));
      setOnboardingField("location", profile.city || city);
      setOnboardingField("guests", profile.guest_count || guestCount);
      setOnboardingField("budget", budgetNum);
      setSaved(true);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; detail?: string } } })?.response?.data;
      setError(data?.message || data?.detail || "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[280px] flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin text-gold" />
        <p className="text-sm">Loading your profile...</p>
      </div>
    );
  }

  const displayPhone = phone
    ? (phone.startsWith("+") ? phone : `+91 ${digitsOnlyPhone(phone)}`)
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">My Profile Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Update your name and wedding preferences. Mobile number stays verified and locked.</p>
      </div>

      <hr className="border-gray-100" />

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} className="shrink-0" />
          Profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Your Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setSaved(false);
            }}
            placeholder="e.g. Aarti Sharma"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Verified Mobile</label>
          <input
            type="text"
            disabled
            value={displayPhone}
            className="w-full bg-zinc-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-400">Mobile number cannot be changed.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Preferred Wedding Location</label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setSaved(false);
            }}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-gold"
          >
            {ALL_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">State</label>
          <select
            value={state}
            onChange={(e) => {
              const next = e.target.value;
              setState(next);
              const cities = CITIES_BY_STATE[next] || [];
              if (cities.length && !cities.includes(city)) setCity(cities[0]);
              setSaved(false);
            }}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-gold"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Wedding Budget (₹)</label>
          <input
            type="number"
            min={1}
            value={budget}
            onChange={(e) => {
              setBudget(e.target.value);
              setSaved(false);
            }}
            placeholder="500000"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Expected Guest Count</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => {
              setGuests(e.target.value);
              setSaved(false);
            }}
            placeholder="150"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)]"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-gold rounded-xl text-xs font-bold px-6 py-3 inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
