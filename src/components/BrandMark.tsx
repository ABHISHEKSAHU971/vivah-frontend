"use client";

import Image from "next/image";

/**
 * The PlanMyVivah logo — the gold-and-ivory knotted dupatta, plus the wordmark.
 *
 * The source artwork also carried a "Wedding" crest above the sash. It's been
 * cut out: a logo for PlanMyVivah shouldn't read "Wedding", and the fine script
 * turned to mush below ~60px anyway.
 *
 * Two layouts of the same asset:
 *  - "mark" — knot beside the wordmark, for navbars and console rails.
 *  - "full" — knot above the wordmark, for footers, auth screens, and anywhere
 *    else with vertical room.
 *
 * Note the explicit `font-heading` on the wordmark: the console scope switches
 * headings to the body sans, and the logo must keep its serif regardless.
 */

const MARK_SIZES = {
  sm: { h: 30, text: "1.05rem" },
  md: { h: 36, text: "1.2rem" },
  lg: { h: 44, text: "1.5rem" },
} as const;

const FULL_SIZES = {
  sm: 140,
  md: 190,
  lg: 250,
} as const;

/** Intrinsic aspect ratio of /public/logo-bow.webp (760 × 485). */
const BOW_RATIO = 760 / 485;

export function BrandMark({
  size = "md",
  tone = "dark",
  variant = "mark",
  showWordmark = true,
  className = "",
}: {
  size?: keyof typeof MARK_SIZES;
  /** "dark" = dark text on light surfaces, "light" = white text on dark ones. */
  tone?: "dark" | "light";
  variant?: "mark" | "full";
  showWordmark?: boolean;
  className?: string;
}) {
  const nameColor = tone === "light" ? "var(--white)" : "var(--text-dark)";

  const wordmark = (
    <span
      className="brand-wordmark font-heading font-semibold tracking-tight leading-none"
      style={{
        fontSize: variant === "full" ? "1.6rem" : MARK_SIZES[size].text,
        color: nameColor,
      }}
    >
      PlanMy<span style={{ color: "var(--gold)" }}>Vivah</span>
    </span>
  );

  // `unoptimized`: Next's image optimizer falls back to JPEG when a client
  // doesn't advertise WebP, and JPEG has no alpha — which paints a white box
  // behind the knot on the dark navbar and footer.
  if (variant === "full") {
    const w = FULL_SIZES[size];
    return (
      <span className={`inline-flex flex-col items-center gap-3 select-none ${className}`}>
        <Image
          src="/logo-bow.webp"
          alt="PlanMyVivah"
          width={w}
          height={Math.round(w / BOW_RATIO)}
          unoptimized
          className="h-auto"
        />
        {showWordmark && wordmark}
      </span>
    );
  }

  const h = MARK_SIZES[size].h;
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <Image
        src="/logo-bow.webp"
        alt="PlanMyVivah"
        width={Math.round(h * BOW_RATIO)}
        height={h}
        unoptimized
        className="shrink-0 transition-transform duration-500 group-hover:scale-105"
      />
      {showWordmark && wordmark}
    </span>
  );
}
