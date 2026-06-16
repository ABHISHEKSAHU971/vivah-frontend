import Link from "next/link";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      { label: "Venues", href: "/venues" },
      { label: "Catering", href: "/services/catering" },
      { label: "Decorations", href: "/services/decorations" },
      { label: "DJ Services", href: "/services/dj-sound" }
    ]
  },
  {
    title: "Platform",
    links: [
      { label: "AI Planner (Beta)", href: "/ai-planner" },
      { label: "Budget Tool", href: "/budget" },
      { label: "Vendor Portal", href: "/vendors" },
      { label: "Partner Program", href: "/partners" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Support", href: "/contact" },
      { label: "Planning Blog", href: "/blog" },
      { label: "For Vendors", href: "/for-vendors" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cancellation Policy", href: "/cancellation" },
      { label: "Refund Policy", href: "/refunds" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="py-20 text-white/90 border-t" style={{ background: "var(--navy-mid)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Upper Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-8 mb-16">
          
          {/* Logo Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-0.5 select-none">
              <span className="font-heading text-white font-semibold text-2xl tracking-tight">
                PlanMyVivah
              </span>
              <span style={{ color: "var(--gold)", fontSize: "1.5rem", fontWeight: 700 }}>.</span>
            </Link>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
              India&apos;s premier celebration ecosystem. Plan your perfect shaadi with verified venues, premium catering, and custom décor.
            </p>
          </div>

          {/* Links Columns */}
          {COLUMNS.map((col, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-gold font-semibold font-body">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Lower Bar */}
        <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p>© {new Date().getFullYear()} PlanMyVivah. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Pinterest</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
