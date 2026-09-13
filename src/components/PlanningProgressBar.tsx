"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import {
  PLANNING_STEPS,
  loadPlanningProgress,
  planningDoneCount,
  type PlanningProgressState,
} from "@/lib/planningProgress";
import { AUTH_CHANGED_EVENT, useStore } from "@/store/store";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
}

/** Same token source AuthMenu uses — avoids missing the bar after login/refresh. */
function subscribeToAuth(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  window.addEventListener("pmv:planning-progress", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
    window.removeEventListener("pmv:planning-progress", onChange);
  };
}

function getStoredToken(): string {
  try {
    return localStorage.getItem("access_token") || readCookie("access_token") || "";
  } catch {
    return "";
  }
}

function getStoredRole(): string {
  try {
    return localStorage.getItem("user_role") || readCookie("user_role") || "";
  } catch {
    return "";
  }
}

const empty = () => "";

/**
 * Fixed strip under the main navbar.
 * Always visible for signed-in customers on public pages.
 */
export default function PlanningProgressBar() {
  const pathname = usePathname();
  const storeRole = useStore((s) => s.userRole);

  const token = useSyncExternalStore(subscribeToAuth, getStoredToken, empty);
  const cookieRole = useSyncExternalStore(subscribeToAuth, getStoredRole, empty);
  const role = storeRole || cookieRole || "";

  const [progress, setProgress] = useState<PlanningProgressState>({});

  useEffect(() => {
    const sync = () => setProgress(loadPlanningProgress());
    sync();
    window.addEventListener("pmv:planning-progress", sync);
    return () => window.removeEventListener("pmv:planning-progress", sync);
  }, [token]);

  const onPortal =
    !!pathname &&
    (pathname.startsWith("/vendor") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/onboarding"));

  // Match AuthMenu: any stored token counts as signed in; skip vendor/admin only.
  const signedIn = !!token && role !== "vendor" && role !== "admin";

  if (!signedIn || onPortal) return null;

  const done = planningDoneCount(progress);
  const pct = Math.round((done / PLANNING_STEPS.length) * 100);

  return (
    <div
      data-planning-progress
      className="fixed top-16 left-0 right-0 z-[45] border-b border-gold/40 bg-[#050D1A] text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
            Your wedding plan
          </p>
          <span className="text-[11px] text-white/70 font-semibold tabular-nums shrink-0">
            {done}/{PLANNING_STEPS.length} done · {pct}%
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden mb-2.5">
          <div
            className="h-full rounded-full bg-gold transition-all duration-500"
            style={{ width: `${done === 0 ? 8 : pct}%` }}
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PLANNING_STEPS.map((step, i) => {
            const sel = progress[step.id];
            const doneStep = Boolean(sel);
            return (
              <div key={step.id} className="flex items-center shrink-0">
                {i > 0 && (
                  <ChevronRight size={14} className="text-gold/50 mx-0.5 sm:mx-1 shrink-0" />
                )}
                <Link
                  href={sel?.href || step.href}
                  title={sel ? `${step.label}: ${sel.name}` : `Choose ${step.label}`}
                  className={`inline-flex items-center gap-1.5 max-w-[10rem] px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    doneStep
                      ? "bg-gold text-black border border-gold"
                      : "bg-white/10 text-white border border-white/25 hover:bg-white/20"
                  }`}
                >
                  {doneStep ? (
                    <Check size={12} className="shrink-0" strokeWidth={2.5} />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/15 border border-white/40 text-[9px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                  )}
                  <span className="truncate">{sel?.name || step.label}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Spacer so listing pages clear the fixed progress strip. */
export function PlanningProgressOffset() {
  const token = useSyncExternalStore(subscribeToAuth, getStoredToken, empty);
  const cookieRole = useSyncExternalStore(subscribeToAuth, getStoredRole, empty);
  const storeRole = useStore((s) => s.userRole);
  const pathname = usePathname();
  const role = storeRole || cookieRole || "";
  const onPortal =
    !!pathname &&
    (pathname.startsWith("/vendor") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/onboarding"));
  const signedIn = !!token && role !== "vendor" && role !== "admin";

  if (!signedIn || onPortal) return null;
  return <div className="h-[4.75rem] sm:h-[4.85rem]" aria-hidden />;
}
