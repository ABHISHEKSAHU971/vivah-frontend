"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Store, User, LogOut, Bell, Loader2, Menu, X, ChevronDown,
} from "lucide-react";
import { useStore } from "@/store/store";
import { authApi, vendorApi, type VendorStatusData } from "@/lib/authApi";

const NAV_ITEMS = [
  { href: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vendor/listings", icon: Store, label: "My Services" },
  { href: "/vendor/profile", icon: User, label: "Vendor Profile", badge: 2 },
];

/** Page title + subtitle shown in the top bar, keyed by route prefix. */
const PAGE_META: { match: (p: string) => boolean; title: string; subtitle: string }[] = [
  { match: (p) => p.startsWith("/vendor/dashboard"), title: "Dashboard", subtitle: "Welcome back — here's what's happening." },
  { match: (p) => p.startsWith("/vendor/listings/add"), title: "Add a Service", subtitle: "Create a new listing for your business." },
  { match: (p) => p.startsWith("/vendor/listings"), title: "My Services", subtitle: "Everything you offer, in one place." },
  { match: (p) => p.startsWith("/vendor/profile"), title: "Vendor Profile", subtitle: "Your business details and documents." },
  { match: (p) => p.startsWith("/vendor/bookings"), title: "Bookings", subtitle: "Confirmed events and schedules." },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useStore((s) => s.clearSession);
  const vendorProfile = useStore((s) => s.vendorProfile);
  const [status, setStatus] = useState<VendorStatusData | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAuthRoute =
    pathname === "/vendor/login" ||
    pathname === "/vendor/register" ||
    pathname === "/vendor/onboarding";

  const checkingOnboarding = !isAuthRoute && !status;

  useEffect(() => {
    if (isAuthRoute) return;
    let cancelled = false;
    vendorApi
      .getStatus()
      .then((next) => {
        if (cancelled) return;
        if (!next.onboarded) {
          router.replace("/vendor/onboarding");
          return;
        }
        setStatus(next);
      })
      .catch(() => {
        if (!cancelled) router.replace("/vendor/onboarding");
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthRoute, pathname, router]);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearSession();
    router.push("/vendor/login");
  };

  if (isAuthRoute) return <>{children}</>;

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <Loader2 size={26} className="animate-spin text-gold" />
        Loading business setup…
      </div>
    );
  }

  const businessName = vendorProfile?.business_name || status?.business_name || "Your business";
  const isApproved = vendorProfile?.is_approved ?? status?.is_approved ?? false;
  const initials =
    businessName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "V";
  const page = PAGE_META.find((m) => m.match(pathname));

  const nav = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <Link href="/" className="flex items-baseline gap-0.5 select-none px-2 shrink-0">
        <span className="font-heading text-[#101828] font-bold text-lg tracking-tight">PlanMyVivah</span>
        <span className="text-gold font-bold text-lg">.</span>
      </Link>
      <p className="px-2 mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3] shrink-0">
        Vendor Portal
      </p>

      {/* Nav */}
      <nav className="mt-7 space-y-1 flex-grow overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
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
              {badge ? (
                <span className="relative shrink-0">
                  <Bell size={14} />
                  <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {badge}
                  </span>
                </span>
              ) : active ? (
                <span className="console-nav-dot" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
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

        {/* ── Desktop rail: pinned, never scrolls with the page ──── */}
        <aside className="hidden md:flex md:flex-col w-[248px] shrink-0 console-rail sticky top-0 h-screen px-4 py-6">
          {nav}
        </aside>

        {/* ── Mobile drawer ──────────────────────────────────────── */}
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
          {/* ── Top bar ──────────────────────────────────────────── */}
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
                <h2 className="text-[15px] font-bold text-[#101828] truncate">{page?.title || "Vendor Portal"}</h2>
                <p className="text-[11px] text-[#98A2B3] truncate">{page?.subtitle || businessName}</p>
              </div>
            </div>

            {/* User chip */}
            <Link
              href="/vendor/profile"
              className="flex items-center gap-2.5 shrink-0 rounded-xl px-2 py-1.5 hover:bg-[#F4F5F7] transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-b from-[#E3C36F] to-[#C9A440] text-[#1A1206] text-xs font-bold flex items-center justify-center shadow-sm">
                {initials}
              </span>
              <span className="hidden sm:block min-w-0 text-left">
                <span className="block text-[13px] font-semibold text-[#101828] truncate max-w-[160px]">
                  {businessName}
                </span>
                <span className="block text-[11px] text-[#98A2B3]">
                  {isApproved ? "Approved vendor" : "Under review"}
                </span>
              </span>
              <ChevronDown size={15} className="hidden sm:block text-[#98A2B3]" />
            </Link>
          </header>

          {/* ── Content ──────────────────────────────────────────── */}
          <main className="flex-grow min-w-0 p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-6xl mx-auto min-h-[500px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
