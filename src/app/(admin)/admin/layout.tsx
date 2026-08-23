"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, MessageSquare, Menu, X, ChevronDown } from "lucide-react";
import { useStore } from "@/store/store";
import { BrandMark } from "@/components/BrandMark";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
];

const PAGE_META: { match: (p: string) => boolean; title: string; subtitle: string }[] = [
  { match: (p) => p.startsWith("/admin/dashboard"), title: "Dashboard", subtitle: "Registrations, listings, inquiries and bookings." },
  { match: (p) => p.startsWith("/admin/inquiries"), title: "Inquiries", subtitle: "Customer leads and venue enquiries." },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setToken = useStore((s) => s.setToken);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoginRoute = pathname === "/admin/login";

  const handleLogout = () => {
    setToken(null);
    router.push("/");
  };

  if (isLoginRoute) return <>{children}</>;

  const page = PAGE_META.find((m) => m.match(pathname));

  const nav = (
    <div className="flex flex-col h-full">
      <Link href="/" className="group flex items-center px-2 shrink-0">
        <BrandMark size="md" tone="dark" />
      </Link>
      <p className="px-2 mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3] shrink-0">
        Admin Console
      </p>

      <nav className="mt-7 space-y-1 flex-grow overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className={`console-nav-link ${active ? "console-nav-link-active" : ""}`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-grow">{label}</span>
              {active && <span className="console-nav-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 pt-4 mt-4 border-t border-[#EAECF0]">
        <button
          onClick={handleLogout}
          className="console-nav-link w-full !text-rose-500 hover:!bg-rose-50 hover:!text-rose-600"
        >
          <LogOut size={17} /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="console min-h-screen font-body">
      <div className="flex">
        <aside className="hidden md:flex md:flex-col w-[248px] shrink-0 console-rail sticky top-0 h-screen px-4 py-6">
          {nav}
        </aside>

        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-[#101828]/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <aside className="relative console-rail w-[17rem] max-w-[82vw] h-full px-4 py-6 animate-fade-in-scale">
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="absolute top-5 right-4 w-8 h-8 rounded-lg border border-[#EAECF0] text-[#667085] flex items-center justify-center"
              >
                <X size={15} />
              </button>
              {nav}
            </aside>
          </div>
        )}

        <div className="flex-grow min-w-0 flex flex-col">
          <header className="console-topbar sticky top-0 z-30 flex items-center justify-between gap-4 px-4 md:px-8 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="md:hidden w-9 h-9 shrink-0 rounded-lg border border-[#EAECF0] text-[#667085] flex items-center justify-center"
              >
                <Menu size={17} />
              </button>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-[#101828] truncate">{page?.title || "Admin Console"}</h2>
                <p className="text-[11px] text-[#98A2B3] truncate">{page?.subtitle || "Platform administration"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 rounded-xl px-2 py-1.5">
              <span className="w-9 h-9 rounded-full bg-gradient-to-b from-[#E3C36F] to-[#C9A440] text-[#1A1206] text-xs font-bold flex items-center justify-center shadow-sm">
                AD
              </span>
              <span className="hidden sm:block min-w-0 text-left">
                <span className="block text-[13px] font-semibold text-[#101828]">Administrator</span>
                <span className="block text-[11px] text-[#98A2B3]">Platform access</span>
              </span>
              <ChevronDown size={15} className="hidden sm:block text-[#98A2B3]" />
            </div>
          </header>

          <main className="flex-grow min-w-0 p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-6xl mx-auto min-h-[500px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
