"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { ShieldCheck, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white font-body">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldCheck size={18} />
          </div>
          <h1 className="text-xl font-heading font-semibold">Admin Panel</h1>
          <p className="text-xs text-zinc-400">Sign in to access platform controls</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-1.5">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Admin Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@planmyvivah.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs mt-2 transition-colors">
            Authorize & Sign In
          </button>
        </form>

      </div>
    </div>
  );
}
