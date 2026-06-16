"use client";

import Link from "next/link";
import { User, Calendar, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);

  const handleLogout = () => {
    setToken(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-body">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col justify-between shrink-0 p-6">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-0.5 select-none">
            <span className="font-heading text-white font-semibold text-xl tracking-tight">
              PlanMyVivah
            </span>
            <span className="text-gold font-bold text-xl">.</span>
          </Link>

          <nav className="space-y-1.5">
            <Link 
              href="/customer/bookings" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-zinc-800 hover:text-white text-zinc-300 transition-all"
            >
              <Calendar size={15} /> My Bookings
            </Link>
            <Link 
              href="/customer/wishlist" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-zinc-800 hover:text-white text-zinc-300 transition-all"
            >
              <Heart size={15} /> Saved Lists
            </Link>
            <Link 
              href="/customer/profile" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-zinc-800 hover:text-white text-zinc-300 transition-all"
            >
              <User size={15} /> My Profile
            </Link>
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={15} /> Log Out
        </button>
      </aside>

      {/* Main panel content */}
      <main className="flex-grow p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
