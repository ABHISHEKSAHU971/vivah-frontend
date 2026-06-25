// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && !original.url?.includes("/auth/")) {
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
