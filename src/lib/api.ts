// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT on every request unless it's a public endpoint
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    const isPublic = config.url?.includes("/send-otp/") || 
                     config.url?.includes("/otp/send/") ||
                     config.url?.includes("/verify-otp/") || 
                     config.url?.includes("/otp/verify/") ||
                     config.url?.includes("/vendor/list/") ||
                     config.url?.includes("/venues/venues/") ||
                     config.url?.includes("/auth/admin/login/");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const shouldSkipRefresh = original.url?.includes("/token/refresh/") ||
                             original.url?.includes("/send-otp/") ||
                             original.url?.includes("/otp/send/") ||
                             original.url?.includes("/verify-otp/") ||
                             original.url?.includes("/otp/verify/") ||
                             original.url?.includes("/auth/admin/login/");
    if (err.response?.status === 401 && !original._retry && !shouldSkipRefresh) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token");
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const { data } = await axios.post(
          `${baseURL}/auth/token/refresh/`,
          { refresh }
        );
        localStorage.setItem("access_token", data.data.access);
        original.headers.Authorization = `Bearer ${data.data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        document.cookie = "access_token=; path=/; max-age=0";
        document.cookie = "user_role=; path=/; max-age=0";
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);
