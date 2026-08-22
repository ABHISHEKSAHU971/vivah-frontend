"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus, Store, Camera, Music, Sparkles, Utensils, Flower, Calendar,
  ArrowRight, MapPin, Eye, Loader2, AlertCircle, Clock,
} from "lucide-react";
import { api } from "@/lib/api";

interface Listing {
  id: number;
  service_type: string;
  name: string;
  description: string;
  city: string;
  state: string;
  status: "draft" | "pending_approval" | "active" | "suspended";
  created_at: string;
  image?: string | null;
  media?: { image: string; is_default: boolean }[];
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  venue: Store,
  dj: Music,
  photographer: Camera,
  makeup: Sparkles,
  caterer: Utensils,
  decorator: Flower,
  planner: Calendar,
};

const SERVICE_LABELS: Record<string, string> = {
  venue: "Venue",
  dj: "DJ & Sound",
  photographer: "Photographer",
  makeup: "Makeup",
  caterer: "Catering",
  decorator: "Decorator",
  planner: "Planner",
};

const STATUS_META: Record<string, { label: string; chip: string; help: string }> = {
  active: {
    label: "Live",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    help: "Visible to couples browsing the site.",
  },
  pending_approval: {
    label: "In review",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    help: "Our team is reviewing this. It stays private until approved.",
  },
  draft: {
    label: "Draft",
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    help: "Not submitted yet — finish it to send for approval.",
  },
  suspended: {
    label: "Suspended",
    chip: "bg-red-50 text-red-700 border-red-200",
    help: "Taken offline. Contact support for details.",
  },
};

export default function VendorListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending_approval" | "draft">("all");

  useEffect(() => {
    api.get("/listings/")
      .then((res) => {
        const data = res.data.data?.listings || res.data.listings || [];
        setListings(data);
      })
      .catch((err) => {
        console.error("Fetch listings error:", err);
        const serverMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error;
        setError(serverMsg || "Could not load your listings. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    pending_approval: listings.filter((l) => l.status === "pending_approval").length,
    draft: listings.filter((l) => l.status === "draft").length,
  }), [listings]);

  const visible = filter === "all" ? listings : listings.filter((l) => l.status === filter);

  return (
    <div className="space-y-7 font-body">

      {/* Action row — the top bar already carries the page title. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {!loading && !error && listings.length > 0 && (
            <>
              {([
                ["all", "All"],
                ["active", "Live"],
                ["pending_approval", "In review"],
                ["draft", "Drafts"],
              ] as const).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setFilter(code)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    filter === code
                      ? "bg-[#101828] text-white border-[#101828] shadow-sm"
                      : "bg-white text-[#667085] border-[#EAECF0] hover:text-[#101828] hover:shadow-sm"
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 ${filter === code ? "text-white/60" : "text-[#98A2B3]"}`}>
                    {counts[code]}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        <Link
          href="/vendor/listings/add"
          className="btn-gold-glossy shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs"
        >
          <Plus size={15} /> Add a Service
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 size={30} className="animate-spin text-gold" />
          <p className="text-sm">Fetching your catalog…</p>
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-center max-w-sm mx-auto">
          <AlertCircle size={30} className="text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="console-card min-h-[44vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
            <Store size={22} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-gray-900 text-base">Nothing listed yet</h3>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Add your first venue or service and we&apos;ll get it reviewed so couples can start finding you.
            </p>
          </div>
          <Link
            href="/vendor/listings/add"
            className="btn-gold-glossy inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs"
          >
            Add your first service <ArrowRight size={14} />
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center text-center gap-2 text-gray-400">
          <Clock size={26} />
          <p className="text-sm">Nothing in this state right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visible.map((item) => {
            const cover = item.image || item.media?.find((m) => m.is_default)?.image || item.media?.[0]?.image;
            const Icon = SERVICE_ICONS[item.service_type] || Store;
            const meta = STATUS_META[item.status] || STATUS_META.draft;
            return (
              <div
                key={item.id}
                className="group console-card console-card-lift overflow-hidden flex flex-col"
              >
                {/* Cover */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Icon size={26} />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border backdrop-blur-sm ${meta.chip}`}>
                    {meta.label}
                  </span>
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/90 text-gray-600 border border-white/60 backdrop-blur-sm">
                    <Icon size={10} /> {SERVICE_LABELS[item.service_type] || item.service_type}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-2.5 flex-grow">
                  <h3 className="font-heading font-semibold text-gray-900 text-base leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin size={10} className="text-gold shrink-0" /> {item.city}, {item.state}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  <p className="text-[10px] text-gray-400 pt-0.5">{meta.help}</p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-[#F9FAFB] border-t border-[#EAECF0] flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/vendor/listings/${item.id}/edit`}
                    className="text-xs text-gold hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye size={12} /> Edit details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
