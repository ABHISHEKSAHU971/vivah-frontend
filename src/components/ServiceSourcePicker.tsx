"use client";

import { AlertCircle, Check, ChefHat, Home, Loader2, Store, Users } from "lucide-react";

export type ServiceSource = "inhouse" | "external" | "none";
export type ServicePolicy = "inhouse" | "external" | "both" | "none";

export interface ServiceOption {
  id: number;
  name: string;
  vendor_name?: string;
  /** Catering only. */
  price_per_plate?: string | number;
  min_plates?: number;
  cuisine_type?: string;
  menu_items?: {
    id: number;
    name: string;
    course: string;
    addon_price?: string | number;
    description?: string;
  }[];
  course_sections?: Record<string, { min: number; max: number }>;
  /** Decoration only. */
  style?: string;
  tiers?: { id: number; tier: string; price: string | number }[];
  description?: string;
}

interface Props {
  kind: "catering" | "decoration";
  /** The venue's rule — which sources the customer is allowed to pick at all. */
  policy: ServicePolicy;
  source: ServiceSource;
  onSourceChange: (next: ServiceSource) => void;
  inhouseOptions: ServiceOption[];
  externalOptions: ServiceOption[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  children?: React.ReactNode;
}

const COPY = {
  catering: {
    title: "Catering",
    inhouseLabel: "Venue's own kitchen",
    externalLabel: "Outside caterer",
    inhouseHint: "Menus cooked by the venue owner.",
    externalHint: "Approved caterers serving this city.",
    emptyInhouse: "This venue doesn't run its own kitchen.",
    emptyExternal: "No outside caterers are free for this city and date.",
    icon: ChefHat,
  },
  decoration: {
    title: "Decoration",
    inhouseLabel: "Venue's own team",
    externalLabel: "Outside decorator",
    inhouseHint: "Themes set up by the venue owner.",
    externalHint: "Approved decorators serving this city.",
    emptyInhouse: "This venue doesn't have an in-house decor team.",
    emptyExternal: "No outside decorators are free for this city and date.",
    icon: Store,
  },
} as const;

/**
 * The in-house vs external chooser used for both catering and decoration.
 *
 * The two tabs list genuinely different things: in-house is only the venue
 * owner's own packages, external is every other approved vendor in the city.
 * A tab with nothing behind it is disabled and says why, rather than opening
 * an empty dropdown.
 */
export default function ServiceSourcePicker({
  kind, policy, source, onSourceChange,
  inhouseOptions, externalOptions, loading,
  selectedId, onSelect, children,
}: Props) {
  const copy = COPY[kind];
  const KindIcon = copy.icon;

  const options = source === "inhouse" ? inhouseOptions : externalOptions;

  // A tab is available when the venue's policy allows it AND somebody actually
  // offers something behind it.
  const inhouseAllowed = policy === "inhouse" || policy === "both";
  const externalAllowed = policy === "external" || policy === "both";
  const inhouseUsable = inhouseAllowed && inhouseOptions.length > 0;
  const externalUsable = externalAllowed && externalOptions.length > 0;

  const disabledReason = (which: "inhouse" | "external") => {
    const allowed = which === "inhouse" ? inhouseAllowed : externalAllowed;
    if (!allowed) return `This venue doesn't allow ${which === "inhouse" ? "in-house" : "outside"} ${copy.title.toLowerCase()}.`;
    return which === "inhouse" ? copy.emptyInhouse : copy.emptyExternal;
  };

  const TAB_BASE =
    "relative flex-1 text-left px-3 py-2.5 rounded-xl border transition-all disabled:cursor-not-allowed";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-700">
          <KindIcon size={13} className="text-gold" /> {copy.title}
        </label>
        {policy === "none" ? (
          <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
            Not offered
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSourceChange("none")}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
              source === "none"
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Skip
          </button>
        )}
      </div>

      {policy === "none" ? (
        <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          Arrange {copy.title.toLowerCase()} separately — this venue doesn&apos;t provide it.
        </p>
      ) : (
        <>
          {/* Source tabs */}
          <div className="flex gap-2">
            {(["inhouse", "external"] as const).map((which) => {
              const usable = which === "inhouse" ? inhouseUsable : externalUsable;
              const count = which === "inhouse" ? inhouseOptions.length : externalOptions.length;
              const active = source === which;
              return (
                <button
                  key={which}
                  type="button"
                  disabled={!usable || loading}
                  title={usable ? undefined : disabledReason(which)}
                  onClick={() => onSourceChange(which)}
                  className={`${TAB_BASE} ${
                    active && usable
                      ? "border-gold bg-gold/5 shadow-sm"
                      : usable
                        ? "border-gray-200 bg-white hover:border-gray-300"
                        : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {which === "inhouse"
                      ? <Home size={12} className={active && usable ? "text-gold" : "text-gray-400"} />
                      : <Store size={12} className={active && usable ? "text-gold" : "text-gray-400"} />}
                    <span className="text-[11px] font-bold text-gray-900">
                      {which === "inhouse" ? copy.inhouseLabel : copy.externalLabel}
                    </span>
                    {active && usable && <Check size={12} className="ml-auto text-gold" />}
                  </span>
                  <span className="block text-[10px] text-gray-500 mt-0.5">
                    {loading
                      ? "Checking…"
                      : usable
                        ? `${count} option${count === 1 ? "" : "s"}`
                        : "Unavailable"}
                  </span>
                </button>
              );
            })}
          </div>

          {source !== "none" && !inhouseUsable && !externalUsable && !loading && (
            <p className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              No {copy.title.toLowerCase()} is bookable here right now. You can still enquire —
              the venue will quote directly.
            </p>
          )}

          {/* Option cards for the chosen source */}
          {source !== "none" && (
            <div className="space-y-2">
              {loading ? (
                <p className="flex items-center gap-2 text-[11px] text-gray-400 py-3">
                  <Loader2 size={13} className="animate-spin" /> Loading options…
                </p>
              ) : options.length === 0 ? (
                <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  {source === "inhouse" ? copy.emptyInhouse : copy.emptyExternal}
                </p>
              ) : (
                options.map((opt) => {
                  const active = String(opt.id) === String(selectedId);
                  const fromPrice =
                    kind === "catering"
                      ? Number(opt.price_per_plate || 0)
                      : Math.min(...(opt.tiers?.map((t) => Number(t.price)) ?? [0]));
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSelect(String(opt.id))}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                        active
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block text-[12px] font-semibold text-gray-900 truncate">
                            {opt.name}
                          </span>
                          <span className="block text-[10px] text-gray-500 truncate">
                            {opt.vendor_name || (source === "inhouse" ? "Venue's own team" : "Partner vendor")}
                            {kind === "catering" && opt.min_plates ? ` · min ${opt.min_plates} plates` : ""}
                            {kind === "decoration" && opt.style ? ` · ${opt.style}` : ""}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          {fromPrice > 0 && (
                            <>
                              <span className="block text-[9px] text-gray-400 leading-none">
                                {kind === "catering" ? "per plate" : "from"}
                              </span>
                              <span className="text-[13px] font-bold text-gray-900">
                                ₹{fromPrice.toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                          {active && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-gold">
                              <Check size={9} /> Selected
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Extra controls the caller wants under the list (decor tiers, menus) */}
          {source !== "none" && options.length > 0 && children}

          <p className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Users size={10} />
            {source === "inhouse" ? copy.inhouseHint : copy.externalHint}
          </p>
        </>
      )}
    </div>
  );
}
