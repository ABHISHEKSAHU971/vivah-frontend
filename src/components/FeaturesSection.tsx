import { Sparkles, IndianRupee, Building2, Utensils, Palette, Music } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    label: "Beta",
    title: "AI Wedding Planner",
    description:
      "Tell us your vision and budget. Your AI planner builds a complete blueprint — venue shortlist, function timeline, and vendor matches.",
  },
  {
    icon: IndianRupee,
    title: "Smart Budget Tool",
    description:
      "Get function-wise cost estimates across venue, catering, decoration, and entertainment — all in ₹.",
  },
  {
    icon: Building2,
    title: "Venue Discovery",
    description:
      "Browse 500+ verified venues by city, type, capacity, and price. Real photos, real reviews, real availability.",
  },
  {
    icon: Utensils,
    title: "Catering Packages",
    description:
      "Veg, Non-Veg, Jain, Rajasthani, South Indian — choose curated menus and compare caterers side by side.",
  },
  {
    icon: Palette,
    title: "Decoration Styles",
    description:
      "Royal, Floral, Bollywood, Traditional — browse full decoration packages and preview stage setups.",
  },
  {
    icon: Music,
    title: "DJ & Entertainment",
    description:
      "Find the perfect DJ and sound setup for every function — from intimate mehendi to grand reception.",
  },
];

export default function FeaturesSection() {
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
            return (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--text-dark)", fontSize: "1rem" }}
                  >
                    {f.title}
                  </h3>
                  {f.label && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "var(--gold-muted)",
                        color: "var(--gold)",
                        border: "1px solid var(--gold-border)",
                      }}
                    >
                      {f.label}
                    </span>
                  )}
                </div>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
                >
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
