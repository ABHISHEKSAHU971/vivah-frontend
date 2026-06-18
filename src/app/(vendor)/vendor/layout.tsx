"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Store, Wrench, User, LogOut, Bell } from "lucide-react";
import { useStore } from "@/store/store";
import { authApi } from "@/lib/authApi";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useStore((s) => s.clearSession);

  // Skip layout rendering on login/register/onboarding routes
  const isAuthRoute = 
    pathname === "/vendor/login" || 
    pathname === "/vendor/register" || 
    pathname === "/vendor/onboarding";

  const handleLogout = async () => {
    // Blacklist the refresh token server-side, then clear local state
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearSession();
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
            {[
              { href: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/vendor/venues", icon: Store, label: "My Venues" },
              { href: "/vendor/services", icon: Wrench, label: "Service Packages" },
            ].map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-gold text-black"
                      : "hover:bg-slate-800 text-zinc-300 hover:text-white"
                  }`}
                >
                  <Icon size={15} /> {label}
                </Link>
              );
            })}

            {/* Profile with notification badge */}
            <Link
              href="/vendor/profile"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                pathname === "/vendor/profile"
                  ? "bg-gold text-black"
                  : "hover:bg-slate-800 text-zinc-300 hover:text-white"
              }`}
            >
              <User size={15} />
              <span className="flex-grow">Vendor Profile</span>
              <span className="relative">
                <Bell size={14} />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-black flex items-center justify-center animate-pulse">
                  2
                </span>
              </span>
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

      {/* Content panel — no white wrapper so profile header gradient shows edge-to-edge */}
      <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
