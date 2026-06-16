"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ShieldAlert, LogOut } from "lucide-react";
import { useStore } from "@/store/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);

  const isLoginRoute = pathname === "/admin/login";

  const handleLogout = () => {
    setToken(null);
    router.push("/");
  };

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-body">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 text-white flex flex-col justify-between shrink-0 p-6">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-0.5 select-none">
            <span className="font-heading text-white font-semibold text-xl tracking-tight">
              PlanMyVivah
            </span>
            <span className="text-gold font-bold text-xl">.</span>
            <span className="ml-2 text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-mono">Admin</span>
          </Link>

          <nav className="space-y-1.5">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all"
            >
              <LayoutDashboard size={15} /> Dashboard
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
        <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
