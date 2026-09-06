"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CalendarOff, CalendarCheck, CalendarDays, Check, Loader2,
  Plus, Store, Trash2, X,
} from "lucide-react";
import {
  availabilityApi, readApiError,
  type Blackout, type BlackoutPayload, type BlackoutReason, type VendorService,
} from "@/lib/availabilityApi";
import {
  AvailabilityCalendar, formatRange, fromISODate, toISODate,
} from "@/components/vendor/AvailabilityCalendar";

const REASONS: { code: BlackoutReason; label: string; hint: string }[] = [
  { code: "booked", label: "Already booked", hint: "Taken by an event booked elsewhere." },
  { code: "full", label: "Fully committed", hint: "No capacity left on these dates." },
  { code: "holiday", label: "Holiday / personal", hint: "Away, festival, or a family event." },
  { code: "maintenance", label: "Maintenance", hint: "Repairs, renovation, or servicing." },
  { code: "other", label: "Other", hint: "Anything else — add a note." },
];

const SERVICE_LABELS: Record<string, string> = {
  venue: "Venue", dj: "DJ & Sound", photographer: "Photographer", makeup: "Makeup",
  caterer: "Catering", decorator: "Decorator", planner: "Planner",
};

const emptyDraft = (): BlackoutPayload => ({
  listing: null,
  start_date: "",
  end_date: "",
  reason: "booked",
  note: "",
});

export default function VendorAvailabilityPage() {
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BlackoutPayload>(emptyDraft);
  /** First day tapped on the calendar while a range is still open. */
  const [anchor, setAnchor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [flash, setFlash] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await availabilityApi.list();
      setBlackouts(data.blackouts);
      setServices(data.services);
      setLoadError("");
    } catch (err) {
      setLoadError(readApiError(err, "Could not load your calendar. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    availabilityApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setBlackouts(data.blackouts);
        setServices(data.services);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(readApiError(err, "Could not load your calendar. Please try again."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const blockedDaysAhead = useMemo(
    () => blackouts.reduce((sum, b) => sum + b.total_days, 0),
    [blackouts]
  );
  const nextBlock = blackouts[0];

  /**
   * Calendar taps drive the draft range: the first tap anchors it to a single
   * day, the second closes it — tapping backwards is fine, the earlier day just
   * becomes the start. A third tap starts a fresh range.
   */
  const handlePickDate = (iso: string) => {
    setFormError("");
    setFormOpen(true);
    if (anchor === null) {
      setAnchor(iso);
      setDraft((prev) => ({ ...prev, start_date: iso, end_date: iso }));
      return;
    }
    setAnchor(null);
    setDraft((prev) => ({
      ...prev,
      start_date: iso < anchor ? iso : anchor,
      end_date: iso < anchor ? anchor : iso,
    }));
  };

  const openBlank = () => {
    setEditingId(null);
    setAnchor(null);
    setDraft(emptyDraft());
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (b: Blackout) => {
    setEditingId(b.id);
    setAnchor(null);
    setDraft({
      listing: b.listing,
      start_date: b.start_date,
      end_date: b.end_date,
      reason: b.reason,
      note: b.note,
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setAnchor(null);
    setDraft(emptyDraft());
    setFormError("");
  };

  const handleSave = async () => {
    if (!draft.start_date || !draft.end_date) {
      setFormError("Pick a start and an end date.");
      return;
    }
    if (draft.end_date < draft.start_date) {
      setFormError("The end date can't be before the start date.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await availabilityApi.update(editingId, draft);
        setFlash("Blocked dates updated.");
      } else {
        await availabilityApi.create(draft);
        setFlash("Dates blocked — customers can no longer request them.");
      }
      await refresh();
      closeForm();
    } catch (err) {
      setFormError(readApiError(err, "Could not save these dates. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await availabilityApi.remove(id);
      setBlackouts((prev) => prev.filter((b) => b.id !== id));
      setFlash("Dates reopened — customers can request them again.");
    } catch (err) {
      setLoadError(readApiError(err, "Could not reopen those dates."));
    } finally {
      setDeletingId(null);
    }
  };

  const selection =
    draft.start_date && draft.end_date
      ? { start: draft.start_date, end: draft.end_date }
      : null;

  const draftDays =
    selection
      ? Math.round(
          (fromISODate(selection.end).getTime() - fromISODate(selection.start).getTime()) / 86_400_000
        ) + 1
      : 0;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 size={30} className="animate-spin text-gold" />
        <p className="text-sm">Opening your calendar…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="console-card console-card-hover p-4">
          <span className="console-tile tile-terracota"><CalendarOff size={18} /></span>
          <p className="console-stat-label mt-3.5">Days Blocked</p>
          <p className="console-stat-value mt-1">{blockedDaysAhead}</p>
          <p className="console-stat-caption mt-1">
            {blockedDaysAhead > 0 ? "Upcoming days you're unavailable" : "You're open on every upcoming date"}
          </p>
        </div>

        <div className="console-card console-card-hover p-4">
          <span className="console-tile tile-gold"><CalendarDays size={18} /></span>
          <p className="console-stat-label mt-3.5">Next Block</p>
          <p className="console-stat-value mt-1 !text-lg">
            {nextBlock ? formatRange(nextBlock.start_date, nextBlock.end_date) : "—"}
          </p>
          <p className="console-stat-caption mt-1">
            {nextBlock ? nextBlock.listing_name : "Nothing coming up"}
          </p>
        </div>

        <div className="console-card console-card-hover p-4">
          <span className="console-tile tile-sage"><CalendarCheck size={18} /></span>
          <p className="console-stat-label mt-3.5">Services Listed</p>
          <p className="console-stat-value mt-1">{services.length}</p>
          <p className="console-stat-caption mt-1">Block one service or all of them</p>
        </div>
      </div>

      {flash && (
        <p className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg font-medium">
          <Check size={13} /> {flash}
        </p>
      )}
      {loadError && (
        <p className="flex items-center gap-2 text-[11px] text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg font-medium">
          <AlertCircle size={13} /> {loadError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#667085]">
          Tap a date on the calendar to start a block, then tap the last date of the period.
        </p>
        <button
          onClick={openBlank}
          className="btn-gold-glossy shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs"
        >
          <Plus size={15} /> Block Dates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
        <AvailabilityCalendar
          blackouts={blackouts}
          selection={selection}
          onPickDate={handlePickDate}
        />

        <div className="space-y-6">
          {/* ── Block / edit form ─────────────────────────────── */}
          {formOpen && (
            <div className="console-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#101828]">
                    {editingId ? "Edit blocked period" : "Block a period"}
                  </h3>
                  <p className="text-[11px] text-[#98A2B3] mt-0.5">
                    {anchor
                      ? "Now tap the last date of the period."
                      : draftDays > 0
                        ? `${draftDays} day${draftDays > 1 ? "s" : ""} selected`
                        : "Pick the dates you can't take bookings."}
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  aria-label="Close"
                  className="w-7 h-7 shrink-0 rounded-lg border border-[#EAECF0] text-[#667085] flex items-center justify-center hover:bg-[#F4F5F7]"
                >
                  <X size={14} />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">
                  Applies to
                </label>
                <select
                  value={draft.listing ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, listing: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EAECF0] bg-white text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  <option value="">All my services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {SERVICE_LABELS[s.service_type] || s.service_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    min={toISODate(new Date())}
                    value={draft.start_date}
                    onChange={(e) => {
                      const start = e.target.value;
                      setAnchor(null);
                      setDraft((d) => ({
                        ...d,
                        start_date: start,
                        end_date: d.end_date && d.end_date < start ? start : d.end_date || start,
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAECF0] bg-white text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    min={draft.start_date || toISODate(new Date())}
                    value={draft.end_date}
                    onChange={(e) => {
                      setAnchor(null);
                      setDraft({ ...draft, end_date: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAECF0] bg-white text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">
                  Reason
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {REASONS.map((r) => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => setDraft({ ...draft, reason: r.code })}
                      className={`text-left px-3 py-2 rounded-xl border transition-all ${
                        draft.reason === r.code
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-[#EAECF0] hover:border-[#DFE3EA]"
                      }`}
                    >
                      <span className="block text-[11px] font-semibold text-[#101828]">{r.label}</span>
                      <span className="block text-[10px] text-[#98A2B3]">{r.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">
                  Note <span className="font-medium normal-case tracking-normal">(optional, private)</span>
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Sharma wedding at the farmhouse"
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EAECF0] bg-white text-xs text-[#101828] placeholder:text-[#C4C9D2] focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>

              {formError && (
                <p className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  <AlertCircle size={13} className="shrink-0 mt-px" /> {formError}
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-gold-glossy flex-grow inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CalendarOff size={14} />}
                  {editingId ? "Save changes" : "Block these dates"}
                </button>
                <button
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#667085] border border-[#EAECF0] hover:bg-[#F4F5F7]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Upcoming blocks ───────────────────────────────── */}
          <div className="console-card p-5">
            <h3 className="text-sm font-semibold text-[#101828] mb-0.5">Blocked periods</h3>
            <p className="text-[11px] text-[#98A2B3] mb-4">
              Customers can&apos;t send enquiries for these dates.
            </p>

            {blackouts.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarCheck size={28} className="mx-auto text-[#D0D5DD] mb-2.5" />
                <p className="text-xs font-semibold text-[#101828]">Open for business</p>
                <p className="text-[11px] text-[#98A2B3] mt-1 max-w-[15rem] mx-auto leading-relaxed">
                  You haven&apos;t blocked any dates. Block a period whenever you&apos;re booked or away.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#F1F3F7] -my-1">
                {blackouts.map((b) => (
                  <li key={b.id} className="py-3 flex items-start gap-3">
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center">
                      <CalendarOff size={14} />
                    </span>
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs font-semibold text-[#101828]">
                        {formatRange(b.start_date, b.end_date)}
                        <span className="ml-1.5 font-medium text-[#98A2B3]">
                          · {b.total_days} day{b.total_days > 1 ? "s" : ""}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#667085] flex items-center gap-1 mt-0.5 truncate">
                        <Store size={10} className="text-gold shrink-0" /> {b.listing_name}
                      </p>
                      <p className="text-[10px] text-[#98A2B3] mt-0.5 truncate">
                        {b.reason_display}
                        {b.note ? ` — ${b.note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(b)}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#667085] border border-[#EAECF0] hover:bg-[#F4F5F7]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        disabled={deletingId === b.id}
                        title="Reopen these dates"
                        aria-label="Reopen these dates"
                        className="w-7 h-7 rounded-lg text-rose-500 border border-[#EAECF0] flex items-center justify-center hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50"
                      >
                        {deletingId === b.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Trash2 size={12} />}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
