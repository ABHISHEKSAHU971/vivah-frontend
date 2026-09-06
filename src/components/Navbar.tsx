"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import AuthMenu from "@/components/AuthMenu";
import { BrandMark } from "@/components/BrandMark";

interface NavLink {
  label: string;
  href: string | null;
  sub?: string[];
  badge?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Venues", href: "/venues" },
  { label: "Services", href: "/services", sub: ["Catering", "Decorations", "DJ & Sound", "Photography", "Makeup"] },
  { label: "AI Planner", href: null, badge: "Coming Soon" },
  { label: "Vendors", href: "/vendor/login" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const showSolidNavbar = !isHome || scrolled;

  /**
   * Auto-hide on the way down, reveal on the way up.
   *
   * `refYRef` is the point the current run is measured from: the shallowest
   * scroll reached while the bar is showing, the deepest while it's hidden.
   * Measuring against a turning point rather than the previous frame is what
   * makes this survive a real trackpad — frame-to-frame deltas lose slow
   * scrolling entirely, and resetting on every direction change means jitter
   * (down 7, up 5, down 7…) never accumulates enough to fire.
   *
   * State the listener needs is read through refs so it registers once and
   * never sees a stale value.
   */
  const refYRef = useRef(0);
  const menuOpenRef = useRef(false);
  const hiddenRef = useRef(false);
  useEffect(() => {
    menuOpenRef.current = mobileOpen || servicesOpen;
  }, [mobileOpen, servicesOpen]);
  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  useEffect(() => {
    // Net travel, away from the last turning point, before the bar reacts.
    const RUN = 60;
    // Never hide above this — near the top there's no space worth reclaiming,
    // and it's past where the homepage navbar finishes turning solid.
    const HIDE_BELOW = 160;
    // Always show again once back up here, whatever the run says.
    const TOP_ZONE = 60;
    let ticking = false;

    const evaluate = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > 20);

      // An open dropdown would slide off-screen with the bar; keep it put.
      if (menuOpenRef.current || y <= TOP_ZONE) {
        refYRef.current = y;
        setHidden(false);
        return;
      }

      if (hiddenRef.current) {
        // Track the deepest point; reveal after RUN of upward travel from it.
        if (y > refYRef.current) refYRef.current = y;
        if (refYRef.current - y > RUN) {
          refYRef.current = y;
          setHidden(false);
        }
      } else {
        // Track the shallowest point; hide after RUN of downward travel from it.
        if (y < refYRef.current) refYRef.current = y;
        if (y - refYRef.current > RUN && y > HIDE_BELOW) {
          refYRef.current = y;
          setHidden(true);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    };

    refYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <nav
      // Keyboard users can tab into the bar while it's off-screen; bring it
      // back rather than moving focus somewhere invisible.
      onFocusCapture={() => setHidden(false)}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: showSolidNavbar ? "rgba(255, 255, 255, 0.96)" : "transparent",
        // Blur only while actually on screen. A translated-away element that
        // still carries backdrop-filter can keep sampling and painting its
        // backdrop at the top of the viewport in Chrome — which looks exactly
        // like a navbar stuck half-way.
        backdropFilter: showSolidNavbar && !hidden ? "blur(12px)" : "none",
        WebkitBackdropFilter: showSolidNavbar && !hidden ? "blur(12px)" : "none",
        borderBottom: showSolidNavbar ? "1px solid rgba(201, 164, 64, 0.12)" : "none",

        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        // `visibility` flips only once the slide has finished (hiding) and
        // immediately on the way back (showing). Once hidden the browser cannot
        // paint the bar at all, so no compositing quirk can leave a band behind.
        visibility: hidden ? "hidden" : "visible",
        // Transition transform/opacity explicitly rather than `all`: animating
        // background and backdrop-filter alongside them is what made the slide
        // muddy and interruptible.
        transition: hidden
          ? "transform 200ms ease-out, opacity 160ms ease-out, visibility 0s linear 200ms"
          : "transform 200ms ease-out, opacity 160ms ease-out, visibility 0s",
        willChange: "transform",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="inline-flex select-none group">
          <BrandMark size="md" tone={showSolidNavbar ? "dark" : "light"} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.sub ? (
              <div key={link.label} className="relative" ref={servicesRef}>
                <button
                  className="flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    color: showSolidNavbar ? "var(--text-dark)" : "rgba(255,255,255,0.8)"
                  }}
                  onClick={() => setServicesOpen(!servicesOpen)}
                >
                  <span className={showSolidNavbar ? "hover:text-gold" : "hover:text-white"}>{link.label}</span>
                  <ChevronDown
                    size={14}
                    className="transition-transform animate-none"
                    style={{ transform: servicesOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
                {servicesOpen && (
                  <div
                    className="absolute top-full mt-2 left-0 rounded-lg py-1.5 min-w-[180px] border animate-fade-in-scale"
                    style={{
                      background: showSolidNavbar ? "rgba(255, 255, 255, 0.98)" : "rgba(10, 22, 40, 0.98)",
                      borderColor: showSolidNavbar ? "rgba(201, 164, 64, 0.2)" : "rgba(201, 164, 64, 0.3)",
                      backdropFilter: "blur(12px)",
                      boxShadow: showSolidNavbar ? "0 8px 32px rgba(5,13,26,0.08)" : "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                  >
                    {link.sub.map((s) => (
                      <Link
                        key={s}
                        href={`/services/${s.toLowerCase().replace(/ & /g, "-").replace(" ", "-")}`}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          showSolidNavbar 
                            ? "hover:text-gold hover:bg-gray-50 text-gray-800" 
                            : "hover:text-white hover:bg-white/5 text-white/80"
                        }`}
                        onClick={() => setServicesOpen(false)}
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  showSolidNavbar ? "hover:text-gold text-gray-800" : "hover:text-white text-white/80"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ 
                      background: "var(--gold-muted)", 
                      color: "var(--gold)", 
                      border: "1px solid var(--gold-border)" 
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ) : (
              <span
                key={link.label}
                className={`flex items-center gap-1.5 text-sm font-medium cursor-not-allowed opacity-60 ${
                  showSolidNavbar ? "text-gray-400" : "text-white/40"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ 
                      background: "rgba(201,164,64,0.08)", 
                      color: "var(--gold)", 
                      border: "1px solid rgba(201,164,64,0.2)" 
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </span>
            )
          )}

          {/* Signed-in name, or a Log in button */}
          <AuthMenu onDark={!showSolidNavbar} />
        </div>

        {/* Mobile: auth chip stays visible next to the hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <AuthMenu onDark={!showSolidNavbar} />
          <button
            className="cursor-pointer"
            style={{ color: showSolidNavbar ? "var(--text-dark)" : "var(--white)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2 border-b"
          style={{ 
            background: showSolidNavbar ? "var(--white)" : "var(--navy)",
            borderColor: showSolidNavbar ? "rgba(0,0,0,0.06)" : "transparent"
          }}
        >
          {NAV_LINKS.map((link) => 
            link.sub ? (
              <div 
                key={link.label} 
                className="py-2 border-b"
                style={{ borderColor: showSolidNavbar ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)" }}
              >
                <button
                  className="flex w-full items-center justify-between py-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: showSolidNavbar ? "var(--text-dark)" : "rgba(255,255,255,0.8)" }}
                  onClick={() => setServicesOpen(!servicesOpen)}
                >
                  <span>{link.label}</span>
                  <ChevronDown
                    size={14}
                    className="transition-transform"
                    style={{ transform: servicesOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
                {servicesOpen && (
                  <div className="pl-4 pb-2 space-y-2.5 mt-1">
                    {link.sub.map((s) => (
                      <Link
                        key={s}
                        href={`/services/${s.toLowerCase().replace(/ & /g, "-").replace(" ", "-")}`}
                        className={`block text-xs transition-colors ${
                          showSolidNavbar ? "hover:text-gold text-gray-500" : "hover:text-white text-white/60"
                        }`}
                        onClick={() => {
                          setMobileOpen(false);
                          setServicesOpen(false);
                        }}
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className={`block py-3 text-sm font-medium border-b transition-colors ${
                  showSolidNavbar ? "text-gray-800 hover:text-gold border-gray-100" : "text-white/80 hover:text-white border-white/5"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: "var(--gold-muted)", color: "var(--gold)" }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ) : (
              <span
                key={link.label}
                className={`flex items-center justify-between py-3 text-sm font-medium border-b cursor-not-allowed opacity-60 ${
                  showSolidNavbar ? "text-gray-400 border-gray-100" : "text-white/40 border-white/5"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(201,164,64,0.08)", color: "var(--gold)", border: "1px solid rgba(201,164,64,0.2)" }}
                  >
                    {link.badge}
                  </span>
                )}
              </span>
            )
          )}
        </div>
      )}
    </nav>
  );
}
