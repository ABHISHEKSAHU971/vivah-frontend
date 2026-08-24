// src/lib/authApi.ts
// Typed API functions for PlanMyVivah auth + vendor endpoints

import { api } from "./api";

// ─── Request / Response Types ────────────────────────────────────────────────

export interface SendOTPRequest {
  phone: string;
  role?: "customer" | "vendor";
  intent?: "login" | "register";
}

export interface SendOTPResponse {
  is_new_user: boolean;
  requires_onboarding: boolean;
  dev_otp?: string; // DEV ONLY — remove once SMS gateway is live
}

export interface VerifyOTPRequest {
  phone: string;
  otp_code: string;
}

export interface UserData {
  id: number;
  phone: string;
  email: string | null;
  full_name: string | null;
  role: "customer" | "vendor" | "admin";
  avatar: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface VerifyOTPResponse {
  access: string;
  refresh: string;
  needs_onboarding: boolean;
  user: UserData;
}

export interface VendorOnboardRequest {
  full_name: string;
  email?: string;
  /** Optional — vendors pick a category per listing, not at onboarding. */
  vendor_type?: VendorType;
  /** Optional when a GSTIN is supplied; the server back-fills from the registry. */
  business_name?: string;
  description?: string;
  city?: string;
  state?: string;
  address?: string;
  gstin?: string;
}

/**
 * Public GST-registry data used to pre-fill business setup.
 * `email` is always null — the GST registry does not expose contact details.
 */
export interface GstLookupData {
  gstin: string;
  legal_name: string;
  trade_name: string;
  business_name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  email: string | null;
  status: string;
  constitution: string;
  registration_date: string;
  nature_of_business: string[];
}

export type VendorType =
  | "venue"
  | "decorator"
  | "caterer"
  | "dj"
  | "planner"
  | "photographer"
  | "outfit"
  | "makeup"
  | "other";

export interface VendorProfileData {
  id: number;
  phone: string;
  full_name: string;
  email: string | null;
  vendor_type: string; // display name e.g. "Venue"
  business_name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  gstin: string;
  logo: string | null;
  is_approved: boolean;
  rejection_reason: string;
  cover_image?: string | null;
  decoration_packages?: any[];
  catering_business?: any;
  details?: any;
  photographer_profile?: any;
  name?: string;
  created_at: string;
}

export interface VendorProfileUpdateRequest {
  full_name?: string;
  email?: string;
  business_name?: string;
  description?: string;
  city?: string;
  state?: string;
  address?: string;
  gstin?: string;
}

export interface VendorStatusData {
  onboarded: boolean;
  is_approved: boolean;
  business_name: string | null;
  vendor_type: string | null;
  rejection_reason: string | null;
  message: string;
}

// ─── API Wrapper ──────────────────────────────────────────────────────────────

/** Unwrap the standard `{ success, data, message }` envelope */
function unwrap<T>(responseData: { success?: boolean; data?: T; message?: string }): T {
  if (responseData.data !== undefined) return responseData.data;
  return responseData as T;
}

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Step 1 of login/register: send OTP to phone.
   * Creates the user if they don't exist.
   */
  sendOtp: async (payload: SendOTPRequest): Promise<SendOTPResponse> => {
    const { data } = await api.post("/auth/send-otp/", payload);
    return unwrap<SendOTPResponse>(data);
  },

  /**
   * Step 2 of login/register: verify OTP → get JWT + user info.
   * `needs_onboarding` tells us whether to redirect to /vendor/onboarding.
   */
  verifyOtp: async (payload: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const { data } = await api.post("/auth/verify-otp/", payload);
    return unwrap<VerifyOTPResponse>(data);
  },

  /**
   * Logout: blacklists the refresh token server-side.
   */
  logout: async (refresh: string): Promise<void> => {
    await api.post("/auth/logout/", { refresh });
  },

  /**
   * Get the current authenticated user's base info.
   */
  getMe: async (): Promise<UserData> => {
    const { data } = await api.get("/auth/me/");
    return unwrap<UserData>(data);
  },

  /**
   * Update base user profile (full_name, email, avatar).
   */
  updateMe: async (payload: Partial<Pick<UserData, "full_name" | "email" | "avatar">>): Promise<UserData> => {
    const { data } = await api.patch("/auth/me/", payload);
    return unwrap<UserData>(data);
  },
};

// ─── Vendor Endpoints ─────────────────────────────────────────────────────────

export const vendorApi = {
  /**
   * Complete vendor onboarding (one-time after first login).
   */
  onboard: async (payload: VendorOnboardRequest): Promise<VendorProfileData> => {
    const { data } = await api.post("/auth/vendor/onboard/", payload);
    return unwrap<VendorProfileData>(data);
  },

  /**
   * Verify a GSTIN against the public GST registry and get back the
   * registered business name + address to pre-fill the setup form.
   */
  lookupGstin: async (gstin: string): Promise<GstLookupData> => {
    const { data } = await api.get("/auth/vendor/gst-lookup/", { params: { gstin } });
    return unwrap<GstLookupData>(data);
  },

  /**
   * Get vendor's full profile.
   */
  getProfile: async (): Promise<VendorProfileData> => {
    const { data } = await api.get("/auth/vendor/profile/");
    return unwrap<VendorProfileData>(data);
  },

  /**
   * Partially update vendor profile fields.
   */
  updateProfile: async (payload: VendorProfileUpdateRequest): Promise<VendorProfileData> => {
    const { data } = await api.patch("/auth/vendor/profile/", payload);
    return unwrap<VendorProfileData>(data);
  },

  /**
   * Upload vendor logo (JPEG/PNG/WebP, max 2MB).
   */
  uploadLogo: async (file: File): Promise<{ logo_url: string | null }> => {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await api.post("/auth/vendor/logo/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<{ logo_url: string | null }>(data);
  },

  /**
   * Check vendor onboarding / approval status.
   */
  getStatus: async (): Promise<VendorStatusData> => {
    const { data } = await api.get("/auth/vendor/status/");
    return unwrap<VendorStatusData>(data);
  },

  /**
   * List approved/verified vendors (public endpoint).
   */
  listApprovedVendors: async (vendorType?: string): Promise<VendorProfileData[]> => {
    const { data } = await api.get("/auth/vendor/list/", {
      params: vendorType ? { vendor_type: vendorType } : {},
    });
    return unwrap<VendorProfileData[]>(data);
  },
};
