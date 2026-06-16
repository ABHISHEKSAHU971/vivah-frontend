"use client";

import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy text-white flex flex-col justify-between font-body" style={{ background: "var(--navy)" }}>
      {/* Small Header */}
      <header className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full border-b border-white/5">
        <Link href="/" className="flex items-center gap-0.5 select-none">
          <span className="font-heading text-white font-semibold text-lg tracking-tight">
            PlanMyVivah
          </span>
          <span className="text-gold font-bold text-lg">.</span>
        </Link>
        <Link href="/" className="text-xs text-white/60 hover:text-white transition-colors">
          Exit Onboarding
        </Link>
      </header>

      {/* Main stepper container */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-navy-mid border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative" style={{ background: "var(--navy-mid)" }}>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent blur-xl pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>

      {/* Basic Footer */}
      <footer className="text-center py-6 text-[10px] text-white/30 border-t border-white/5 w-full">
        © {new Date().getFullYear()} PlanMyVivah. All rights reserved.
      </footer>
    </div>
  );
}
