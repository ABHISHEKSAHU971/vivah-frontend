"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Blackout } from "@/lib/availabilityApi";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Local-time YYYY-MM-DD. `toISOString()` would shift IST dates back a day. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatRange(start: string, end: string): string {
  const s = fromISODate(start);
  const e = fromISODate(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  if (start === end) return s.toLocaleDateString("en-IN", opts);
  const sameYear = s.getFullYear() === e.getFullYear();
  const startLabel = s.toLocaleDateString("en-IN", sameYear ? { day: "numeric", month: "short" } : opts);
  return `${startLabel} – ${e.toLocaleDateString("en-IN", opts)}`;
}

interface Props {
  blackouts: Blackout[];
  /** Currently drafted range, highlighted while the vendor picks dates. */
  selection: { start: string; end: string } | null;
  onPickDate: (iso: string) => void;
}

/**
 * Two-month view of the vendor's calendar. Blocked days are shaded; clicking a
 * free day starts a range and clicking a second day closes it.
 */
export function AvailabilityCalendar({ blackouts, selection, onPickDate }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const todayISO = toISODate(today);

  /** ISO date -> the label to show on hover, for every blocked day. */
  const blockedDays = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of blackouts) {
      const cur = fromISODate(b.start_date);
      const last = fromISODate(b.end_date);
      while (cur <= last) {
        map.set(toISODate(cur), `${b.listing_name} — ${b.reason_display}`);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [blackouts]);

  const inSelection = (iso: string) =>
    !!selection && iso >= selection.start && iso <= selection.end;

  const months = [cursor, new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)];

  return (
    <div className="console-card p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          aria-label="Previous month"
          className="w-8 h-8 rounded-lg border border-[#EAECF0] text-[#667085] flex items-center justify-center hover:bg-[#F4F5F7] transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Your calendar
        </p>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          aria-label="Next month"
          className="w-8 h-8 rounded-lg border border-[#EAECF0] text-[#667085] flex items-center justify-center hover:bg-[#F4F5F7] transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {months.map((month) => {
          const year = month.getFullYear();
          const monthIdx = month.getMonth();
          const firstWeekday = new Date(year, monthIdx, 1).getDay();
          const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array(firstWeekday).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];

          return (
            <div key={`${year}-${monthIdx}`}>
              <p className="text-[12px] font-semibold text-[#101828] text-center mb-2.5">
                {MONTHS[monthIdx]} {year}
              </p>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d, i) => (
                  <span key={i} className="text-[9px] font-bold uppercase text-[#98A2B3] text-center py-1">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (day === null) return <span key={`pad-${i}`} />;
                  const iso = toISODate(new Date(year, monthIdx, day));
                  const isPast = iso < todayISO;
                  const blocked = blockedDays.get(iso);
                  const selected = inSelection(iso);

                  let tone = "text-[#344054] hover:bg-[#F4F5F7]";
                  if (isPast) tone = "text-[#D0D5DD] cursor-not-allowed";
                  else if (selected) tone = "bg-[#101828] text-white font-semibold";
                  else if (blocked) tone = "bg-rose-50 text-rose-600 font-semibold line-through decoration-rose-300";

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isPast}
                      title={blocked || (isPast ? "" : "Click to block from here")}
                      onClick={() => onPickDate(iso)}
                      className={`aspect-square rounded-lg text-[11px] flex items-center justify-center transition-colors ${tone} ${
                        iso === todayISO && !selected ? "ring-1 ring-inset ring-gold" : ""
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#F1F3F7] text-[10px] text-[#98A2B3]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-50 border border-rose-200" /> Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#101828]" /> Selecting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-1 ring-inset ring-gold" /> Today
        </span>
      </div>
    </div>
  );
}
