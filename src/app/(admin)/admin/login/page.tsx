"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Simulate admin login
      document.cookie = "access_token=mock_admin_token; path=/";
      document.cookie = "user_role=admin; path=/";
      setToken("mock_admin_token", "admin");
      router.push("/admin/dashboard");
    } else {
      setError("Please check your email and password credentials.");
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
