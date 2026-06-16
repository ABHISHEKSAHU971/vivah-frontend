"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Store, Wrench, User, LogOut, CheckSquare } from "lucide-react";
import { useStore } from "@/store/store";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);

  // Skip layout rendering on login/register/onboarding routes
  const isAuthRoute = 
    pathname === "/vendor/login" || 
    pathname === "/vendor/register" || 
    pathname === "/vendor/onboarding";

  const handleLogout = () => {
    setToken(null);
    router.push("/");
  };

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-body">
      {/* Vendor Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 p-6">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-0.5 select-none">
            <span className="font-heading text-white font-semibold text-xl tracking-tight">
              PlanMyVivah
            </span>
            <span className="text-gold font-bold text-xl">.</span>
            <span className="ml-2 text-[10px] bg-slate-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">Vendor</span>
          </Link>

          <nav className="space-y-1.5">
            <Link 
              href="/vendor/dashboard" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-zinc-300 hover:text-white transition-all"
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link 
              href="/vendor/venues" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-zinc-300 hover:text-white transition-all"
            >
              <Store size={15} /> My Venues
            </Link>
            <Link 
              href="/vendor/services" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-zinc-300 hover:text-white transition-all"
            >
              <Wrench size={15} /> Service Packages
            </Link>
            <Link 
              href="/vendor/profile" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-zinc-300 hover:text-white transition-all"
            >
              <User size={15} /> Vendor Profile
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

      {/* Content panel */}
      <main className="flex-grow p-6 md:p-10">
        <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
