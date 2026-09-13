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
import { AUTH_CHANGED_EVENT } from "@/store/store";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
}

function subscribeAuth(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  window.addEventListener("pmv:planning-progress", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
    window.removeEventListener("pmv:planning-progress", onChange);
  };
}

function getToken(): string {
  try {
    return localStorage.getItem("access_token") || readCookie("access_token") || "";
  } catch {
    return "";
  }
}

const empty = () => "";

/**
 * In-document wedding plan progress (not fixed).
 * Renders only for signed-in customers — used on listing strips and detail pages.
 */
export default function WeddingPlanProgress({ className = "" }: { className?: string }) {
  const token = useSyncExternalStore(subscribeAuth, getToken, empty);
  const pathname = usePathname() || "";
  // Show whenever logged in on the public site (same bar AuthMenu uses for "Ar").
  const signedIn = !!token;
  const hideOnPortal =
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding");

  const [progress, setProgress] = useState<PlanningProgressState>({});

  useEffect(() => {
    const sync = () => setProgress(loadPlanningProgress());
    sync();
    window.addEventListener("pmv:planning-progress", sync);
    return () => window.removeEventListener("pmv:planning-progress", sync);
  }, [token]);

  if (!signedIn || hideOnPortal) return null;

  const done = planningDoneCount(progress);
  const pct = Math.round((done / PLANNING_STEPS.length) * 100);

  return (
    <div className={`bg-[#050D1A] text-white border-b-2 border-gold ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
            Your wedding plan
          </p>
          <span className="text-[11px] text-white/70 font-semibold tabular-nums">
            {done}/{PLANNING_STEPS.length} · {pct}%
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden mb-2.5">
          <div
            className="h-full rounded-full bg-gold transition-all duration-500"
            style={{ width: `${done === 0 ? 8 : pct}%` }}
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {PLANNING_STEPS.map((step, i) => {
            const sel = progress[step.id];
            const doneStep = Boolean(sel);
            return (
              <div key={step.id} className="flex items-center shrink-0">
                {i > 0 && (
                  <ChevronRight size={14} className="text-gold/60 mx-0.5 sm:mx-1 shrink-0" />
                )}
                <Link
                  href={sel?.href || step.href}
                  title={sel ? `${step.label}: ${sel.name}` : `Choose ${step.label}`}
                  className={`inline-flex items-center gap-1.5 max-w-[10rem] px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                    doneStep
                      ? "bg-gold text-black"
                      : "bg-white/10 text-white border border-white/25"
                  }`}
                >
                  {doneStep ? (
                    <Check size={12} strokeWidth={2.5} className="shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-white/40 text-[9px] flex items-center justify-center shrink-0">
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
