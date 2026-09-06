// src/lib/availabilityApi.ts
// Vendor availability — the date ranges a vendor is NOT taking bookings on.

import { api } from "./api";

export type BlackoutReason = "booked" | "full" | "holiday" | "maintenance" | "other";

export interface Blackout {
  id: number;
  /** null = the block applies to every service the vendor owns. */
  listing: number | null;
  listing_name: string;
  service_type: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: BlackoutReason;
  reason_display: string;
  note: string;
  total_days: number;
  is_past: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorService {
  id: number;
  name: string;
  service_type: string;
  status: string;
}

export interface AvailabilityOverview {
  blackouts: Blackout[];
  services: VendorService[];
  today: string;
}

export interface BlackoutPayload {
  listing: number | null;
  start_date: string;
  end_date: string;
  reason: BlackoutReason;
  note?: string;
}

/** Pull the first human-readable line out of a DRF error envelope. */
export function readApiError(err: unknown, fallback: string): string {
  const res = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!res) return fallback;

  const errors = res.errors as Record<string, unknown> | string[] | string | undefined;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors) && errors.length) return String(errors[0]);
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === "string") return first;
  }
  if (typeof res.message === "string" && res.message) return res.message;
  if (typeof res.detail === "string") return res.detail;
  return fallback;
}

export const availabilityApi = {
  /** Upcoming blackouts + the vendor's services (for the scope picker). */
  list: async (includePast = false): Promise<AvailabilityOverview> => {
    const { data } = await api.get("/bookings/vendor/availability/", {
      params: includePast ? { include_past: "true" } : undefined,
    });
    return data.data ?? data;
  },

  create: async (payload: BlackoutPayload): Promise<Blackout> => {
    const { data } = await api.post("/bookings/vendor/availability/", payload);
    return data.data ?? data;
  },

  update: async (id: number, payload: Partial<BlackoutPayload>): Promise<Blackout> => {
    const { data } = await api.patch(`/bookings/vendor/availability/${id}/`, payload);
    return data.data ?? data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/bookings/vendor/availability/${id}/`);
  },

  /** Public: dates a customer must not be able to pick for a listing. */
  blockedDatesFor: async (listingId: number): Promise<string[]> => {
    const { data } = await api.get(`/bookings/availability/${listingId}/`);
    return (data.data ?? data).blocked_dates ?? [];
  },
};
