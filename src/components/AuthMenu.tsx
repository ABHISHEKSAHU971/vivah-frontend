"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck, ChevronDown, Heart, LayoutDashboard, LogIn, LogOut, User,
} from "lucide-react";
import { AUTH_CHANGED_EVENT, useStore } from "@/store/store";
import { authApi } from "@/lib/authApi";
import PlanningGateModal from "@/components/PlanningGateModal";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
}

/**
 * The stored token, read through useSyncExternalStore so the server renders the
 * signed-out state and the client swaps in the real one without a hydration
 * mismatch — and without a setState-in-effect.
 */
function subscribeToStoredToken(onChange: () => void) {
  window.addEventListener("storage", onChange);           // other tabs
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);  // this tab
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  };
}

function getStoredToken(): string {
  try {
    return localStorage.getItem("access_token") || readCookie("access_token") || "";
  } catch {
    return "";
  }
}

const noStoredToken = () => "";

/** "Aarti Sharma" -> "AS"; falls back to the last two digits of the phone. */
function initialsFor(name: string | null | undefined, phone: string | null | undefined): string {
  const letters = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (letters) return letters;
  const digits = (phone || "").replace(/\D/g, "");
  return digits.slice(-2) || "?";
}

/** The first word of a name, so the navbar chip stays short. */
function firstName(name: string | null | undefined): string {
  return (name || "").trim().split(" ")[0] || "";
}

const CUSTOMER_LINKS = [
  { href: "/customer/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/customer/wishlist", label: "Wishlist", icon: Heart },
  { href: "/customer/profile", label: "Profile", icon: User },
];

/**
 * Login state for the public site: a Log in button when signed out, and the
 * customer's name with an account menu when signed in.
 *
 * `onDark` renders for the transparent navbar over the homepage hero.
 */
export default function AuthMenu({ onDark = false }: { onDark?: boolean }) {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const role = useStore((s) => s.userRole);
  const setUser = useStore((s) => s.setUser);
  const clearSession = useStore((s) => s.clearSession);

  const [open, setOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read the token *only* through the external store. The zustand store seeds
  // itself from localStorage at module load, so using it here would make the
  // client's first render disagree with the server's and break hydration.
  const signedIn = !!useSyncExternalStore(
    subscribeToStoredToken, getStoredToken, noStoredToken
  );

  // A page refresh keeps the token but loses the user object — fetch it back so
  // we can greet them by name rather than showing a bare avatar.
  useEffect(() => {
    if (!signedIn || user) return;
    let cancelled = false;
    authApi
      .getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        // A dead token is handled by the api interceptor; nothing to do here.
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, user, setUser]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Log out locally even if the API call fails.
    }
    clearSession();
    router.push("/");
  };

  if (!signedIn) {
    return (
      <>
        <button
          onClick={() => setGateOpen(true)}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
            onDark
              ? "text-white border-white/30 hover:bg-white/10 hover:border-white/50"
              : "text-gray-900 border-gold/40 hover:bg-gold/5 hover:border-gold"
          }`}
        >
          <LogIn size={14} /> Log in
        </button>

        <PlanningGateModal
          isOpen={gateOpen}
          onClose={() => setGateOpen(false)}
          mode="login"
          kind="venue"
          title="Log in"
          subtitle="Enter your mobile number — we'll text you a code. No password to remember."
        />
      </>
    );
  }

  const label = firstName(user?.full_name) || "My account";
  const homeHref =
    role === "vendor" ? "/vendor/dashboard" : role === "admin" ? "/admin/dashboard" : null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all ${
          onDark
            ? "border-white/25 hover:bg-white/10"
            : "border-gray-200 hover:border-gold/50 hover:bg-gold/5"
        }`}
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-b from-[#E3C36F] to-[#C9A440] text-[#1A1206] text-[11px] font-bold flex items-center justify-center shrink-0">
          {initialsFor(user?.full_name, user?.phone)}
        </span>
        <span
          className={`hidden sm:block text-sm font-semibold max-w-[110px] truncate ${
            onDark ? "text-white" : "text-gray-900"
          }`}
        >
          {label}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            onDark ? "text-white/60" : "text-gray-400"
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_-8px_rgba(16,24,40,0.18)] py-1.5 animate-fade-in-scale z-[60]"
        >
          <div className="px-3.5 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.full_name || "Signed in"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.phone || ""}</p>
          </div>

          {homeHref && (
            <Link
              href={homeHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LayoutDashboard size={14} className="text-gray-400" /> Dashboard
            </Link>
          )}

          {(!role || role === "customer") &&
            CUSTOMER_LINKS.map(({ href, label: linkLabel, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Icon size={14} className="text-gray-400" /> {linkLabel}
              </Link>
            ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-gray-100 mt-1 pt-2"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
