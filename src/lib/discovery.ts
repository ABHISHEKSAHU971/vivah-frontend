// src/lib/discovery.ts
// Shared vocabulary for the "tell us what you need, then see matching listings"
// flow that every discovery card on the homepage runs through.

export type DiscoveryKind = "venue" | "catering" | "decoration" | "dj";

export interface DiscoveryBrief {
  city: string;
  /** ISO YYYY-MM-DD. Empty when the couple has not fixed a date yet. */
  date: string;
  guests: number;
}

interface DiscoveryTarget {
  label: string;
  /** Listing route the brief resolves to. */
  path: string;
  blurb: string;
}

export const DISCOVERY_TARGETS: Record<DiscoveryKind, DiscoveryTarget> = {
  venue: {
    label: "Venue Discovery",
    path: "/venues",
    blurb: "We'll show venues free on your date with room for your guest list.",
  },
  catering: {
    label: "Catering Packages",
    path: "/services/catering",
    blurb: "We'll show caterers serving your city who can plate for your numbers.",
  },
  decoration: {
    label: "Decoration Styles",
    path: "/services/decorations",
    blurb: "We'll show decorators available in your city on your date.",
  },
  dj: {
    label: "DJ & Entertainment",
    path: "/services/dj-sound",
    blurb: "We'll show DJs and sound crews free on your date.",
  },
};

/** Bucket a raw guest count into the range label the venue filter expects. */
export function guestRangeLabel(guests: number): string {
  if (guests <= 300) return "100-300 guests";
  if (guests <= 600) return "300-600 guests";
  if (guests <= 1000) return "600-1000 guests";
  return "1000+ guests";
}

/** Turn a brief into the listing URL for a given service. */
export function briefToListingUrl(kind: DiscoveryKind, brief: DiscoveryBrief): string {
  const params = new URLSearchParams();
  if (brief.city) params.set("city", brief.city);
  if (brief.date) params.set("date", brief.date);
  if (brief.guests) {
    params.set("guests", kind === "venue" ? guestRangeLabel(brief.guests) : String(brief.guests));
  }
  const query = params.toString();
  return query ? `${DISCOVERY_TARGETS[kind].path}?${query}` : DISCOVERY_TARGETS[kind].path;
}

/** Normalise an Indian mobile number to the 10 digits the API expects. */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}

/** Today as YYYY-MM-DD in local time — `toISOString()` would shift IST back a day. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
