import { create } from "zustand";

interface OnboardingState {
  phone: string;
  otpVerified: boolean;
  location: string;
  budget: number;
  guests: number;
}

interface AppStore {
  onboarding: OnboardingState;
  token: string | null;
  userRole: "customer" | "vendor" | "admin" | null;
  setToken: (token: string | null, role?: "customer" | "vendor" | "admin" | null) => void;
  setOnboardingField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  resetOnboarding: () => void;
}

const initialOnboardingState: OnboardingState = {
  phone: "",
  otpVerified: false,
  location: "",
  budget: 500000, // Default 5 Lakhs
  guests: 150, // Default 150 guests
};

export const useStore = create<AppStore>((set) => ({
  onboarding: initialOnboardingState,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  userRole: typeof window !== "undefined" ? (localStorage.getItem("user_role") as any) : null,

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
