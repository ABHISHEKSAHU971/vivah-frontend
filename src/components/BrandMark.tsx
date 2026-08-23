"use client";

/**
 * The PlanMyVivah wordmark — gold droplet + Playfair "PlanMy·Vivah".
 *
 * Extracted from the marketing navbar so the consoles use the real logo instead
 * of re-typing the name. Note the explicit `font-heading` on the wordmark: the
 * console scope switches headings to the body sans, and the logo must keep its
 * serif regardless.
 */

const SIZES = {
  sm: { icon: 26, text: "1.05rem" },
  md: { icon: 32, text: "1.2rem" },
  lg: { icon: 40, text: "1.5rem" },
} as const;

export function BrandMark({
  size = "md",
  tone = "dark",
  className = "",
}: {
  size?: keyof typeof SIZES;
  /** "dark" = dark text on light surfaces, "light" = white text on dark ones. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const { icon, text } = SIZES[size];
  const nameColor = tone === "light" ? "var(--white)" : "var(--text-dark)";
  const dotColor = tone === "light" ? "var(--white)" : "var(--text-dark)";
  const gradientId = `brand-gold-${size}-${tone}`;

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-500 group-hover:rotate-12"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2D07C" />
            <stop offset="50%" stopColor="#C9A440" />
            <stop offset="100%" stopColor="#9C7721" />
          </linearGradient>
        </defs>
        <path
          d="M50 15 C35 30, 20 45, 20 60 C20 76.5, 33.5 90, 50 90 C66.5 90, 80 76.5, 80 60 C80 45, 65 30, 50 15 Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M50 30 C40 42, 32 55, 32 65 C32 75, 40 82, 50 82 C60 82, 68 75, 68 65 C68 55, 60 42, 50 30 Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M50 45 C45 52, 40 60, 40 67 C40 73, 44 76, 50 76 C56 76, 60 73, 60 67 C60 60, 55 52, 50 45 Z"
          fill={`url(#${gradientId})`}
          opacity="0.9"
        />
        <circle cx="50" cy="62" r="3.5" fill={dotColor} />
      </svg>

      <span
        className="brand-wordmark font-heading font-semibold tracking-tight leading-none"
        style={{ fontSize: text, color: nameColor }}
      >
        PlanMy<span style={{ color: "var(--gold)" }}>Vivah</span>
      </span>
    </span>
  );
}
