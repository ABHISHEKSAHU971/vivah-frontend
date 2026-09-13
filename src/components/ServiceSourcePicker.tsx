"use client";

import { useState } from "react";
import {
  AlertCircle, Check, ChefHat, Home, Loader2, Store, Users, X,
} from "lucide-react";

export type ServiceSource = "inhouse" | "external" | "none";
export type ServicePolicy = "inhouse" | "external" | "both" | "none";

export interface ServiceOption {
  id: number;
  name: string;
  vendor_name?: string;
  is_inhouse?: boolean;
  /** Catering only. */
  price_per_plate?: string | number;
  price_per_plate_without_material?: string | number;
  material_option?: string;
  min_plates?: number;
  cuisine_type?: string;
  description?: string;
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
  includes?: string[];
  excludes?: string[];
  colour_theme?: string[];
  flowers?: string[];
  tiers?: {
    id: number;
    name?: string;
    tier: string;
    price: string | number;
    description?: string;
    inclusions?: string[];
    excludes?: string[];
    min_guests?: number;
    max_guests?: number;
  }[];
  add_ons?: { id: number; name: string; price: string | number }[];
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

function PackageDetailsModal({
  kind,
  option,
  onClose,
}: {
  kind: "catering" | "decoration";
  option: ServiceOption;
  onClose: () => void;
}) {
  const fromPrice =
    kind === "catering"
      ? Number(option.price_per_plate || 0)
      : Math.min(...(option.tiers?.map((t) => Number(t.price)) ?? [0]).filter((n) => n > 0), Infinity);

  const menuByCourse = (option.menu_items ?? []).reduce<Record<string, string[]>>((acc, item) => {
    const course = item.course || "other";
    if (!acc[course]) acc[course] = [];
    acc[course].push(item.name);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#050D1A]/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${option.name} details`}
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 bg-white border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gold">
              {kind === "catering" ? "Catering package" : "Decoration theme"}
            </p>
            <h3 className="text-base font-semibold text-gray-900 truncate">{option.name}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              {option.vendor_name || (option.is_inhouse ? "Venue's own team" : "Partner vendor")}
              {kind === "catering" && option.cuisine_type ? ` · ${option.cuisine_type}` : ""}
              {kind === "decoration" && option.style ? ` · ${option.style}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">
          {Number.isFinite(fromPrice) && fromPrice > 0 && (
            <div className="rounded-xl bg-gold/5 border border-gold/20 px-3 py-2.5 flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {kind === "catering" ? "Per plate" : "From"}
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{fromPrice.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {kind === "catering" && (
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {option.min_plates ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-[9px] font-bold uppercase text-gray-400">Min plates</p>
                  <p className="font-semibold text-gray-900">{option.min_plates}</p>
                </div>
              ) : null}
              {option.price_per_plate_without_material ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-[9px] font-bold uppercase text-gray-400">Without material</p>
                  <p className="font-semibold text-gray-900">
                    ₹{Number(option.price_per_plate_without_material).toLocaleString("en-IN")}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {option.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description</p>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{option.description}</p>
            </div>
          )}

          {kind === "catering" && Object.keys(menuByCourse).length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Menu items</p>
              <div className="space-y-2">
                {Object.entries(menuByCourse).map(([course, names]) => (
                  <div key={course} className="rounded-xl border border-gray-100 px-3 py-2">
                    <p className="text-[11px] font-bold text-gray-800 capitalize mb-1">{course}</p>
                    <p className="text-[12px] text-gray-600 leading-relaxed">{names.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kind === "decoration" && (
            <>
              {!!option.includes?.length && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Includes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {option.includes.map((item) => (
                      <span key={item} className="text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!!option.excludes?.length && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Not included</p>
                  <div className="flex flex-wrap gap-1.5">
                    {option.excludes.map((item) => (
                      <span key={item} className="text-[11px] px-2 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!!option.tiers?.length && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Packages</p>
                  <div className="space-y-2">
                    {option.tiers.map((tier) => (
                      <div key={tier.id} className="rounded-xl border border-gray-100 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-gray-900">
                              {tier.name || String(tier.tier).toUpperCase()}
                            </p>
                            {(tier.min_guests || tier.max_guests) && (
                              <p className="text-[11px] text-gray-500">
                                Guests {tier.min_guests || "—"}–{tier.max_guests || "—"}
                              </p>
                            )}
                          </div>
                          <p className="shrink-0 text-[13px] font-bold text-gray-900">
                            ₹{Number(tier.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                        {tier.description && (
                          <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed">{tier.description}</p>
                        )}
                        {!!tier.inclusions?.length && (
                          <p className="text-[11px] text-gray-500 mt-1.5">
                            Includes: {tier.inclusions.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!!option.add_ons?.length && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Add-ons</p>
                  <ul className="space-y-1">
                    {option.add_ons.map((a) => (
                      <li key={a.id} className="flex justify-between gap-2 text-[12px] text-gray-700">
                        <span>{a.name}</span>
                        <span className="font-semibold">₹{Number(a.price).toLocaleString("en-IN")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 px-5 py-3 bg-white border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-gold w-full justify-center rounded-xl py-2.5 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [detailsOpt, setDetailsOpt] = useState<ServiceOption | null>(null);

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
          {/* Source tabs — only show tabs that actually have options */}
          <div className="flex gap-2">
            {(["inhouse", "external"] as const)
              .filter((which) => {
                const usable = which === "inhouse" ? inhouseUsable : externalUsable;
                // Hide empty Outside / in-house stubs; show a tab only when bookable.
                return usable || loading;
              })
              .map((which) => {
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

          {/* When only one source exists, auto-label without empty twin tab */}
          {!loading && inhouseUsable && !externalUsable && source === "inhouse" && (
            <p className="text-[10px] text-gray-500 -mt-1">
              Showing this venue&apos;s own {copy.title.toLowerCase()} options.
            </p>
          )}
          {!loading && externalUsable && !inhouseUsable && source === "external" && (
            <p className="text-[10px] text-gray-500 -mt-1">
              Venue kitchen unavailable — choose an outside option below.
            </p>
          )}

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
                    <div
                      key={opt.id}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                        active
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(String(opt.id))}
                        className="w-full text-left"
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailsOpt(opt);
                        }}
                        className="mt-2 text-[10px] font-semibold text-gold hover:text-gold/80 underline-offset-2 hover:underline"
                      >
                        See full details
                      </button>
                    </div>
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

      {detailsOpt && (
        <PackageDetailsModal kind={kind} option={detailsOpt} onClose={() => setDetailsOpt(null)} />
      )}
    </div>
  );
}
