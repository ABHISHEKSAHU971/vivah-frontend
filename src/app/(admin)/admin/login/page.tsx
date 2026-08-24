"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { ShieldAlert } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

import { api } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please check your email and password credentials.");
      return;
    }

    try {
      const response = await api.post("/auth/admin/login/", { email, password });
      const { access, refresh } = response.data.data;
      
      // Save tokens in cookies for middleware and localStorage for axios
      document.cookie = `access_token=${access}; path=/; max-age=86400`;
      document.cookie = `user_role=admin; path=/; max-age=86400`;
      localStorage.setItem("refresh_token", refresh);
      setToken(access, "admin");
      
      router.push("/admin/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Invalid admin credentials.";
      setError(msg);
    }
  };

  return (
    <div className="console-auth flex items-center justify-center p-6 font-body">
      <div className="max-w-sm w-full console-card rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <BrandMark size="lg" tone="dark" className="justify-center" />
          <h1 className="text-lg font-semibold text-[#101828] pt-1">Admin Panel</h1>
          <p className="text-xs text-[#667085]">Sign in to access platform controls</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs flex items-center gap-1.5">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">Admin Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@planmyvivah.com"
              className="field-light"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field-light"
            />
          </div>

          <button type="submit" className="btn-gold-glossy w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm mt-2">
            Authorize & Sign In
          </button>
        </form>

      </div>
    </div>
  );
}
