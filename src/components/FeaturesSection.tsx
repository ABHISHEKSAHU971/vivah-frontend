"use client";

import { useState } from "react";
import { ArrowRight, Building2, Clock, IndianRupee, Music, Palette, Sparkles, Utensils } from "lucide-react";
import PlanningGateModal from "@/components/PlanningGateModal";
import type { DiscoveryKind } from "@/lib/discovery";

type Feature = {
  icon: typeof Sparkles;
  title: string;
  description: string;
  /** Set for the four live cards — clicking runs the discovery gate. */
  kind?: DiscoveryKind;
  /** Set for features that aren't shipped yet. */
  comingSoon?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "AI Wedding Planner",
    comingSoon: true,
    description:
      "Tell us your vision and budget. Your AI planner builds a complete blueprint — venue shortlist, function timeline, and vendor matches.",
  },
  {
    icon: IndianRupee,
    title: "Smart Budget Tool",
    comingSoon: true,
    description:
      "Get function-wise cost estimates across venue, catering, decoration, and entertainment — all in ₹.",
  },
  {
    icon: Building2,
    title: "Venue Discovery",
    kind: "venue",
    description:
      "Browse 500+ verified venues by city, type, capacity, and price. Real photos, real reviews, real availability.",
  },
  {
    icon: Utensils,
    title: "Catering Packages",
    kind: "catering",
    description:
      "Veg, Non-Veg, Jain, Rajasthani, South Indian — choose curated menus and compare caterers side by side.",
  },
  {
    icon: Palette,
    title: "Decoration Styles",
    kind: "decoration",
    description:
      "Royal, Floral, Bollywood, Traditional — browse full decoration packages and preview stage setups.",
  },
  {
    icon: Music,
    title: "DJ & Entertainment",
    kind: "dj",
    description:
      "Find the perfect DJ and sound setup for every function — from intimate mehendi to grand reception.",
  },
];

export default function FeaturesSection() {
  const [gateKind, setGateKind] = useState<DiscoveryKind | null>(null);

  return (
    <section className="py-24" style={{ background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="eyebrow mb-4">Capabilities</p>
          <h2
            className="font-heading"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              color: "var(--text-dark)",
              maxWidth: "540px",
              lineHeight: 1.15,
            }}
          >
            One platform for every{" "}
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>moment</em>{" "}
            that matters.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;

            const body = (
              <>
                <div className="feature-icon">
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--text-dark)", fontSize: "1rem" }}
                  >
                    {f.title}
                  </h3>
                  {f.comingSoon && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <Clock size={9} /> Coming Soon
                    </span>
                  )}
                </div>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
                >
                  {f.description}
                </p>
              </>
            );

            // Not shipped yet — render flat and non-interactive so nobody
            // clicks into a dead end.
            if (f.comingSoon) {
              return (
                <div
                  key={f.title}
                  aria-disabled="true"
                  className="feature-card relative opacity-60 cursor-not-allowed select-none"
                >
                  {body}
                </div>
              );
            }

            return (
              <button
                key={f.title}
                type="button"
                onClick={() => setGateKind(f.kind!)}
                className="feature-card text-left w-full cursor-pointer group transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2"
              >
                {body}
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-gold group-hover:gap-2 transition-all">
                  Start planning <ArrowRight size={13} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <PlanningGateModal
        isOpen={gateKind !== null}
        onClose={() => setGateKind(null)}
        kind={gateKind ?? "venue"}
      />
    </section>
  );
}
