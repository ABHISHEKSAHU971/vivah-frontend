"use client";

/**
 * Multi-theme decoration builder.
 *
 * A decorator lists several themes (Haldi, Mehendi, Sangeet, Reception), each
 * with its own design details, any number of named packages, and optional
 * add-ons. Shape matches the backend: { themes: [ { ..., tiers: [], add_ons: [] } ] }
 */

import { useState } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";

export const DECORATION_STYLES = [
  { value: "traditional", label: "Traditional" },
  { value: "royal", label: "Royal" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal Luxury" },
  { value: "floral", label: "Floral" },
  { value: "contemporary", label: "Contemporary" },
  { value: "rustic", label: "Rustic" },
  { value: "bollywood", label: "Bollywood" },
  { value: "cultural", label: "Cultural" },
  { value: "outdoor", label: "Outdoor Garden" },
  { value: "custom", label: "Custom" },
];

const PACKAGE_LABELS = ["", "budget", "standard", "premium", "luxury"];

const TRAVEL_POLICIES = [
  { value: "", label: "Not specified" },
  { value: "included", label: "Included" },
  { value: "extra", label: "Charged extra" },
  { value: "depends", label: "Depends on location" },
];

export interface DecorationPackageRow {
  name: string;
  tier: string;
  price: string;
  description: string;
  min_guests: string;
  max_guests: string;
  inclusions: string[];
  excludes: string[];
}

export interface DecorationAddOnRow {
  name: string;
  price: string;
}

export interface DecorationTheme {
  name: string;
  style: string;
  description: string;
  colour_theme: string[];
  flowers: string[];
  materials: string[];
  drapery: string[];
  drapery_notes: string;
  lighting: string[];
  lighting_notes: string;
  backdrop_design: string;
  includes: string[];
  excludes: string[];
  advance_percent: string;
  setup_time_hours: string;
  travel_policy: string;
  cancellation_policy: string;
  tiers: DecorationPackageRow[];
  add_ons: DecorationAddOnRow[];
}

export const emptyPackage = (): DecorationPackageRow => ({
  name: "", tier: "", price: "", description: "",
  min_guests: "", max_guests: "", inclusions: [], excludes: [],
});

export const emptyTheme = (): DecorationTheme => ({
  name: "", style: "traditional", description: "",
  colour_theme: [], flowers: [], materials: [],
  drapery: [], drapery_notes: "", lighting: [], lighting_notes: "",
  backdrop_design: "", includes: [], excludes: [],
  advance_percent: "", setup_time_hours: "", travel_policy: "", cancellation_policy: "",
  tiers: [emptyPackage()], add_ons: [],
});

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] transition-all";
const labelCls = "text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5";


export const COMMON_INCLUSION_TAGS = [
  "Haldi Setup",
  "Sangeet Stage",
  "Mehendi Backdrop",
  "Reception Stage",
  "Floral Mandap",
  "Welcome Gate",
  "Stage Backdrop",
  "Selfie Point",
  "Jhula Decor",
  "Pathway Draping",
  "Varmala Stage",
  "LED & Ambient Lights",
];

export const COMMON_EXCLUSION_TAGS = [
  "Catering",
  "Sound & DJ System",
  "Generator & Power Backup",
  "Venue Booking Fee",
  "Personal Floral Jewelry",
  "Photography & Videography",
];

export const COLOUR_THEME_TAGS = [
  "Marigold Yellow",
  "Pastel Pink",
  "Ivory & Gold",
  "Royal Red",
  "Lavender & White",
  "Emerald Green",
];

export const FLOWER_TAGS = [
  "Marigold",
  "Rose",
  "Jasmine",
  "Orchid",
  "Carnation",
  "Lotus",
  "Baby's Breath",
];

export const MATERIAL_TAGS = [
  "Fresh Flowers",
  "Artificial Flowers",
  "Brass Props",
  "Wooden Mandap",
  "Velvet Drapes",
  "Fairy Lights",
];

export const DRAPERY_TAGS = [
  "Velvet Drapes",
  "Chiffon & Organza",
  "Satin Drapes",
  "Gold Zari Drapes",
  "Floral Draping",
];

export const LIGHTING_TAGS = [
  "Warm Ambient Lights",
  "Fairy Lights",
  "Chandeliers",
  "LED Spotlights",
  "Cold Pyro Sparklers",
];

/** Free-form list input with quick-add suggestion tags: type, press Enter, or click tags. */
function ChipInput({
  label, hint, placeholder, values, onChange, suggestions,
}: {
  label: string; hint?: string; placeholder: string;
  values: string[]; onChange: (next: string[]) => void;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  const add = (text?: string) => {
    const v = (text ?? draft).trim();
    if (!v) return;
    if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    if (!text) setDraft("");
  };

  const toggleSuggestion = (sug: string) => {
    const exists = values.some((x) => x.toLowerCase() === sug.toLowerCase());
    if (exists) {
      onChange(values.filter((x) => x.toLowerCase() !== sug.toLowerCase()));
    } else {
      onChange([...values, sug]);
    }
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap items-center gap-1.5 border border-gray-200 rounded-xl px-2.5 py-2 bg-white focus-within:border-gold focus-within:shadow-[0_0_0_3px_rgba(201,164,64,0.15)] transition-all">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-gold/10 border border-gold/40 text-gold text-xs font-semibold">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}
              className="w-4 h-4 rounded-full hover:bg-gold/25 flex items-center justify-center">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          onBlur={() => add()}
          placeholder={placeholder}
          className="flex-grow min-w-[140px] px-1.5 py-1 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
        />
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Popular Quick Add Tags:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug) => {
              const isSelected = values.some((x) => x.toLowerCase() === sug.toLowerCase());
              return (
                <button
                  key={sug}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleSuggestion(sug)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-gold text-white shadow-xs border border-gold"
                      : "bg-gray-100 hover:bg-gold/10 hover:text-gold hover:border-gold/30 text-gray-700 border border-gray-200"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <span className="font-bold">✓</span> {sug}
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 font-bold">+</span> {sug}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}


function Section({
  index, title, requirement, subtitle, children, defaultOpen = false, hasError = false,
}: {
  index: number; title: string; requirement: string; subtitle: string;
  children: React.ReactNode; defaultOpen?: boolean; hasError?: boolean;
}) {
  const [manuallyOpen, setManuallyOpen] = useState(defaultOpen);
  const open = manuallyOpen || hasError;
  const setOpen = (fn: (p: boolean) => boolean) => setManuallyOpen((p) => fn(open));
  return (
    <div
      data-error={hasError ? "true" : undefined}
      className={`border rounded-2xl bg-white overflow-hidden ${
        hasError ? "border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]" : "border-gray-150"
      }`}
    >
      <button type="button" onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left ${
          hasError ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-gray-50/70"
        }`}>
        <span className="w-7 h-7 shrink-0 rounded-full bg-gold/12 border border-gold/30 text-gold text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <span className="flex-grow min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{title}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
              requirement === "Required"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}>{requirement}</span>
            {hasError && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                Needs attention
              </span>
            )}
          </span>
          <span className="block text-[11px] text-gray-400 mt-0.5">{subtitle}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-5 pt-1 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

export function DecorationBuilder({
  themes, onChange, errors = {},
}: {
  themes: DecorationTheme[];
  onChange: (next: DecorationTheme[]) => void;
  errors?: Record<string, string>;
}) {
  const list = themes.length ? themes : [emptyTheme()];

  const patch = (i: number, changes: Partial<DecorationTheme>) =>
    onChange(list.map((t, idx) => (idx === i ? { ...t, ...changes } : t)));

  const patchPackage = (ti: number, pi: number, changes: Partial<DecorationPackageRow>) =>
    patch(ti, { tiers: list[ti].tiers.map((p, idx) => (idx === pi ? { ...p, ...changes } : p)) });

  /** True when any error key for this theme starts with one of `fields`. */
  const sectionHasError = (ti: number, fields: string[]) =>
    Object.keys(errors).some((key) =>
      fields.some((f) => key.startsWith(`themes.${ti}.${f}`))
    );

  return (
    <div className="space-y-5">
      {list.map((theme, ti) => (
        <div key={ti} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-gray-900">
              Theme {ti + 1}{theme.name ? ` — ${theme.name}` : ""}
            </h3>
            {list.length > 1 && (
              <button type="button" onClick={() => onChange(list.filter((_, i) => i !== ti))}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 inline-flex items-center gap-1">
                <Trash2 size={12} /> Remove theme
              </button>
            )}
          </div>

          {/* 1 — Basic information */}
          <Section index={1} title="Basic information" requirement="Required" hasError={sectionHasError(ti, ["name", "style", "description"])}
            subtitle="Theme name, style and a short description" defaultOpen>
            <div>
              <label className={labelCls}>Decoration theme name *</label>
              <input value={theme.name} onChange={(e) => patch(ti, { name: e.target.value })}
                placeholder="e.g. Royal Marigold Wedding Decor"
                className={`${inputCls} ${errors[`themes.${ti}.name`] ? "border-red-400" : ""}`} />
              {errors[`themes.${ti}.name`] && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors[`themes.${ti}.name`]}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Decoration style *</label>
              <select value={theme.style} onChange={(e) => patch(ti, { style: e.target.value })}
                className={`${inputCls} ${errors[`themes.${ti}.style`] ? "border-red-400" : ""}`}>
                {DECORATION_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {errors[`themes.${ti}.style`] && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors[`themes.${ti}.style`]}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Short description *</label>
              <textarea rows={3} maxLength={1000} value={theme.description}
                onChange={(e) => patch(ti, { description: e.target.value })}
                placeholder="Elegant marigold-themed decoration with traditional floral arrangements, warm lighting and premium fabric draping."
                className={`${inputCls} resize-none ${errors[`themes.${ti}.description`] ? "border-red-400" : ""}`} />
              <p className="text-[10px] text-gray-400 mt-1">{theme.description.length}/1000 characters</p>
              {errors[`themes.${ti}.description`] && (
                <p className="text-[10px] text-red-500 font-semibold">{errors[`themes.${ti}.description`]}</p>
              )}
            </div>
          </Section>

          {/* 2 — Design & decoration details */}
          <Section index={2} title="Design & decoration details" requirement="Optional"
            subtitle="Colours, flowers, materials, drapery and lighting">
            <ChipInput label="Colour theme" placeholder="Add a colour" values={theme.colour_theme}
              onChange={(v) => patch(ti, { colour_theme: v })}
              suggestions={COLOUR_THEME_TAGS}
              hint="e.g. Marigold Orange, Ivory, Deep Red" />
            <ChipInput label="Flowers" placeholder="Add a flower" values={theme.flowers}
              onChange={(v) => patch(ti, { flowers: v })}
              suggestions={FLOWER_TAGS} />
            <ChipInput label="Materials" placeholder="Add a material" values={theme.materials}
              onChange={(v) => patch(ti, { materials: v })}
              suggestions={MATERIAL_TAGS} />
            <ChipInput label="Drapery" placeholder="Add drapery type" values={theme.drapery}
              onChange={(v) => patch(ti, { drapery: v })}
              suggestions={DRAPERY_TAGS} />
            <div>
              <label className={labelCls}>Drapery notes</label>
              <input value={theme.drapery_notes} onChange={(e) => patch(ti, { drapery_notes: e.target.value })}
                placeholder="Gold & cream fabric draping" className={inputCls} />
            </div>
            <ChipInput label="Lighting" placeholder="Add lighting type" values={theme.lighting}
              onChange={(v) => patch(ti, { lighting: v })}
              suggestions={LIGHTING_TAGS} />
            <div>
              <label className={labelCls}>Lighting notes</label>
              <input value={theme.lighting_notes} onChange={(e) => patch(ti, { lighting_notes: e.target.value })}
                placeholder="Warm lights, fairy lights, decorative hanging lights" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Background / stage design</label>
              <textarea rows={3} value={theme.backdrop_design}
                onChange={(e) => patch(ti, { backdrop_design: e.target.value })}
                placeholder="Premium floral backdrop with gold frame, cream draping and warm lighting."
                className={`${inputCls} resize-none`} />
            </div>
          </Section>

          {/* 3 — Packages & pricing */}
          <Section index={3} title="Packages & pricing" requirement="Required" hasError={sectionHasError(ti, ["tiers"])}
            subtitle="Create as many packages as you like — no fixed tiers" defaultOpen>
            {theme.tiers.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center">
                No packages yet. Add packages like &ldquo;Basic Wedding Decor&rdquo; or &ldquo;Royal Wedding Package&rdquo;.
              </p>
            )}

            {theme.tiers.map((pkg, pi) => (
              <div key={pi} className="border border-gray-150 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Package {pi + 1}</span>
                  {theme.tiers.length > 1 && (
                    <button type="button"
                      onClick={() => patch(ti, { tiers: theme.tiers.filter((_, i) => i !== pi) })}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 inline-flex items-center gap-1">
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Package name *</label>
                    <input value={pkg.name} onChange={(e) => patchPackage(ti, pi, { name: e.target.value })}
                      placeholder="e.g. Classic Wedding Decor"
                      className={`${inputCls} ${errors[`themes.${ti}.tiers.${pi}.name`] ? "border-red-400" : ""}`} />
                  </div>
                  <div>
                    <label className={labelCls}>Package label (optional)</label>
                    <select value={pkg.tier} onChange={(e) => patchPackage(ti, pi, { tier: e.target.value })} className={inputCls}>
                      {PACKAGE_LABELS.map((l) => (
                        <option key={l} value={l}>{l ? l[0].toUpperCase() + l.slice(1) : "No label"}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Package description</label>
                  <textarea rows={2} value={pkg.description}
                    onChange={(e) => patchPackage(ti, pi, { description: e.target.value })}
                    placeholder="Elegant decoration package suitable for medium-sized weddings."
                    className={`${inputCls} resize-none`} />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Price (₹) *</label>
                    <input type="number" min={1} value={pkg.price}
                      onChange={(e) => patchPackage(ti, pi, { price: e.target.value })}
                      placeholder="35000"
                      className={`${inputCls} ${errors[`themes.${ti}.tiers.${pi}.price`] ? "border-red-400" : ""}`} />
                    {errors[`themes.${ti}.tiers.${pi}.price`] && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">{errors[`themes.${ti}.tiers.${pi}.price`]}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Guests from</label>
                    <input type="number" min={1} value={pkg.min_guests}
                      onChange={(e) => patchPackage(ti, pi, { min_guests: e.target.value })}
                      placeholder="300" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Guests up to</label>
                    <input type="number" min={1} value={pkg.max_guests}
                      onChange={(e) => patchPackage(ti, pi, { max_guests: e.target.value })}
                      placeholder="500" className={inputCls} />
                  </div>
                </div>

                <ChipInput label="Package-specific inclusions" placeholder="e.g. Premium Stage Decoration"
                  values={pkg.inclusions} onChange={(v) => patchPackage(ti, pi, { inclusions: v })}
                  suggestions={COMMON_INCLUSION_TAGS} />
                <ChipInput label="What's not included" placeholder="e.g. Generator"
                  values={pkg.excludes} onChange={(v) => patchPackage(ti, pi, { excludes: v })}
                  suggestions={COMMON_EXCLUSION_TAGS} />
              </div>
            ))}

            <button type="button" onClick={() => patch(ti, { tiers: [...(theme.tiers || []), emptyPackage()] })}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:border-gold hover:text-gold transition-all inline-flex items-center justify-center gap-1.5">
              <Plus size={14} /> {theme.tiers.length ? "Add another package" : "Add your first package"}
            </button>
          </Section>

          {/* 4 — Optional add-ons */}
          <Section index={4} title="Optional add-ons" requirement="Optional"
            subtitle="Extras customers can buy on top of any package">
            <p className="text-[11px] text-gray-400">
              Examples: LED Wall — ₹8,000 · Extra Floral Decoration — ₹5,000 · Premium Lighting — ₹7,500
            </p>
            {theme.add_ons.map((a, ai) => (
              <div key={ai} className="flex flex-col sm:flex-row gap-2">
                <input value={a.name} placeholder="Add-on name"
                  onChange={(e) => patch(ti, { add_ons: theme.add_ons.map((x, i) => i === ai ? { ...x, name: e.target.value } : x) })}
                  className={`${inputCls} flex-grow`} />
                <input type="number" min={1} value={a.price} placeholder="Price ₹"
                  onChange={(e) => patch(ti, { add_ons: theme.add_ons.map((x, i) => i === ai ? { ...x, price: e.target.value } : x) })}
                  className={`${inputCls} sm:w-40`} />
                <button type="button" aria-label="Remove add-on"
                  onClick={() => patch(ti, { add_ons: theme.add_ons.filter((_, i) => i !== ai) })}
                  className="shrink-0 px-3 rounded-xl border border-gray-200 text-red-500 hover:border-red-300 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => patch(ti, { add_ons: [...theme.add_ons, { name: "", price: "" }] })}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:border-gold hover:text-gold transition-all inline-flex items-center justify-center gap-1.5">
              <Plus size={14} /> Add add-on
            </button>
          </Section>

          {/* 5 — Commercials & policies */}
          <Section index={5} title="Commercials & policies" requirement="Optional"
            subtitle="Advance, setup time, travel and cancellation">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Advance required (%)</label>
                <input type="number" min={0} max={100} value={theme.advance_percent}
                  onChange={(e) => patch(ti, { advance_percent: e.target.value })}
                  placeholder="30" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Setup time (hours)</label>
                <input type="number" min={0} value={theme.setup_time_hours}
                  onChange={(e) => patch(ti, { setup_time_hours: e.target.value })}
                  placeholder="6" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Travel / transport</label>
              <select value={theme.travel_policy} onChange={(e) => patch(ti, { travel_policy: e.target.value })} className={inputCls}>
                {TRAVEL_POLICIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Cancellation policy</label>
              <textarea rows={2} value={theme.cancellation_policy}
                onChange={(e) => patch(ti, { cancellation_policy: e.target.value })}
                placeholder="e.g. Full refund if cancelled 15+ days before the event."
                className={`${inputCls} resize-none`} />
            </div>
          </Section>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...list, emptyTheme()])}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:border-gold hover:text-gold transition-all inline-flex items-center justify-center gap-1.5">
        <Plus size={15} /> Add another decoration theme
      </button>
    </div>
  );
}
