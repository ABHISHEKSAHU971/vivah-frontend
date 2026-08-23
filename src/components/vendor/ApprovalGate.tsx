"use client";

/**
 * Blocks the "add a service" flow until the vendor's profile is approved.
 *
 * The backend already rejects listing creation with a 403 for unapproved
 * vendors (ListingService.create_vendor_listing), but nothing checked on the
 * client — so a vendor could pick a category, complete every step of the form
 * and upload photos, only to be rejected at the final submit. This checks at
 * the moment they start adding a service instead.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { vendorApi, type VendorStatusData } from "@/lib/authApi";

export function ApprovalGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VendorStatusData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    vendorApi
      .getStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        // Don't lock the vendor out on a transient error — the server still
        // enforces the rule on submit.
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status && !failed) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-[#98A2B3]">
        <Loader2 size={26} className="animate-spin text-gold" />
        <p className="text-sm">Checking your account status…</p>
      </div>
    );
  }

  if (status && !status.is_approved) {
    const rejected = Boolean(status.rejection_reason);
    return (
      <div className="max-w-xl mx-auto">
        <div className="console-card p-8 text-center space-y-5">
          <span
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
              rejected
                ? "bg-red-50 text-red-500 border border-red-100"
                : "bg-amber-50 text-amber-500 border border-amber-100"
            }`}
          >
            {rejected ? <ShieldAlert size={24} /> : <Clock size={24} />}
          </span>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#101828]">
              {rejected ? "Your application wasn't approved" : "Your profile is still under review"}
            </h2>
            <p className="text-xs text-[#667085] leading-relaxed max-w-md mx-auto">
              {rejected
                ? "You'll need an approved profile before you can add services. Here's what our team said:"
                : "You can add services as soon as our team approves your business profile. We'll notify you the moment that happens — usually within one working day."}
            </p>
          </div>

          {rejected && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-left">
              {status.rejection_reason}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Link
              href="/vendor/listings"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#EAECF0] text-[#667085] hover:text-[#101828] hover:shadow-sm transition-all"
            >
              <ArrowLeft size={14} /> Back to My Services
            </Link>
            <Link
              href="/vendor/profile"
              className="btn-gold-glossy inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs"
            >
              <ShieldCheck size={14} /> Review my profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
