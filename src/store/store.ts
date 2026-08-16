import { create } from "zustand";
import type { UserData, VendorProfileData } from "@/lib/authApi";

interface OnboardingState {
  phone: string;
  otpVerified: boolean;
  location: string;
  budget: number;
  guests: number;
}

interface AppStore {
  // Onboarding wizard state (customer flow)
  onboarding: OnboardingState;

  // Auth state
  token: string | null;
  userRole: "customer" | "vendor" | "admin" | null;

  // User data
  user: UserData | null;
  vendorProfile: VendorProfileData | null;

  // Actions
  setToken: (token: string | null, role?: "customer" | "vendor" | "admin" | null) => void;
  setUser: (user: UserData | null) => void;
  setVendorProfile: (profile: VendorProfileData | null) => void;
  setOnboardingField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  resetOnboarding: () => void;

  /** Full logout: clears tokens + user state. Caller is responsible for calling the API first. */
  clearSession: () => void;
}

const initialOnboardingState: OnboardingState = {
  phone: "",
  otpVerified: false,
  location: "",
  budget: 500000,
  guests: 150,
};

export const useStore = create<AppStore>((set) => ({
  onboarding: initialOnboardingState,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  userRole: typeof window !== "undefined" ? (localStorage.getItem("user_role") as "customer" | "vendor" | "admin" | null) : null,
  user: null,
  vendorProfile: null,

  setToken: (token, role = null) => {
    if (token) {
      localStorage.setItem("access_token", token);
      if (role) localStorage.setItem("user_role", role);
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("refresh_token");
    }
    set({ token, userRole: role });
  },

  setUser: (user) => set({ user }),

  setVendorProfile: (vendorProfile) => set({ vendorProfile }),

  clearSession: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    // also clear cookie for SSR middleware
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "user_role=; path=/; max-age=0";
    set({ token: null, userRole: null, user: null, vendorProfile: null });
  },

  setOnboardingField: (key, value) =>
    set((state) => ({
      onboarding: {
        ...state.onboarding,
        [key]: value,
      },
    })),

  resetOnboarding: () =>
    set({
      onboarding: initialOnboardingState,
    }),
}));
