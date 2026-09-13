"use client";

import Link from "next/link";
import { User, Calendar, Heart, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authApi } from "@/lib/authApi";
import { useStore } from "@/store/store";
import { BrandMark } from "@/components/BrandMark";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const clearSession = useStore((s) => s.clearSession);

  useEffect(() => {
    if (user) return;
    let cancelled = false;
    authApi
      .getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        /* interceptor handles dead tokens */
      });
    return () => {
      cancelled = true;
    };
  }, [user, setUser]);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const initial = (user?.full_name || user?.phone || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-body">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col justify-between shrink-0 p-6">
        <div className="space-y-8">
          <Link href="/" className="group flex items-center">
            <BrandMark size="md" tone="light" />
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

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <span className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold flex items-center justify-center shrink-0">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name?.trim() || "My account"}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">{user?.phone || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
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
