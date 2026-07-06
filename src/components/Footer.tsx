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
            <Link href="/" className="flex items-center gap-2 select-none group">
              <svg
                width="38"
                height="38"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 transition-transform duration-500 group-hover:rotate-12"
              >
                <defs>
                  <linearGradient id="footer-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F2D07C" />
                    <stop offset="50%" stopColor="#C9A440" />
                    <stop offset="100%" stopColor="#9C7721" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 15 C35 30, 20 45, 20 60 C20 76.5, 33.5 90, 50 90 C66.5 90, 80 76.5, 80 60 C80 45, 65 30, 50 15 Z"
                  stroke="url(#footer-gold-grad)"
                  strokeWidth="5"
                  fill="none"
                />
                <path
                  d="M50 30 C40 42, 32 55, 32 65 C32 75, 40 82, 50 82 C60 82, 68 75, 68 65 C68 55, 60 42, 50 30 Z"
                  stroke="url(#footer-gold-grad)"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.85"
                />
                <path
                  d="M50 45 C45 52, 40 60, 40 67 C40 73, 44 76, 50 76 C56 76, 60 73, 60 67 C60 60, 55 52, 50 45 Z"
                  fill="url(#footer-gold-grad)"
                  opacity="0.9"
                />
                <circle cx="50" cy="62" r="3.5" fill="var(--white)" />
              </svg>
              <span className="font-heading text-white font-semibold text-2xl tracking-tight">
                PlanMy<span style={{ color: "var(--gold)" }}>Vivah</span>
              </span>
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
