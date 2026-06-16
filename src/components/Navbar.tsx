"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { label: "Venues", href: "/venues" },
  { label: "Services", href: "/services", sub: ["Catering", "Decorations", "DJ & Sound"] },
  { label: "AI Planner", href: "/ai-planner", badge: "Beta" },
  { label: "Vendors", href: "/vendor/login" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const showSolidNavbar = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: showSolidNavbar
          ? "rgba(255, 255, 255, 0.96)"
          : "transparent",
        backdropFilter: showSolidNavbar ? "blur(12px)" : "none",
        borderBottom: showSolidNavbar ? "1px solid rgba(201, 164, 64, 0.12)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 select-none">
          <span
            className="font-heading font-semibold tracking-tight transition-colors duration-300"
            style={{ 
              fontSize: "1.35rem",
              color: showSolidNavbar ? "var(--text-dark)" : "var(--white)" 
            }}
          >
            PlanMyVivah
          </span>
          <span style={{ color: "var(--gold)", fontSize: "1.35rem", fontWeight: 700 }}>.</span>
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
                    className="absolute top-full mt-2 left-0 rounded-lg py-1.5 min-w-[180px] border transition-all duration-200"
                    style={{
                      background: showSolidNavbar ? "var(--white)" : "var(--navy-mid)",
                      borderColor: showSolidNavbar ? "rgba(0,0,0,0.08)" : "rgba(201, 164, 64, 0.15)",
                      boxShadow: showSolidNavbar ? "0 8px 32px rgba(0,0,0,0.08)" : "0 8px 32px rgba(0,0,0,0.4)",
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
            ) : (
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
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/onboarding/verification" 
            className={`text-sm font-medium transition-colors cursor-pointer ${
              showSolidNavbar ? "text-gray-800 hover:text-gold" : "text-white/80 hover:text-white"
            }`}
          >
            Sign In
          </Link>
          <Link href="/onboarding/verification" className="btn-gold text-sm cursor-pointer">
            Start Planning
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden cursor-pointer"
          style={{ color: showSolidNavbar ? "var(--text-dark)" : "var(--white)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
            ) : (
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
            )
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Link 
              href="/onboarding/verification" 
              className={`text-center py-2.5 rounded text-xs font-semibold border transition-all ${
                showSolidNavbar 
                  ? "border-gray-200 text-gray-800 hover:bg-gray-50" 
                  : "border-white/20 text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/onboarding/verification" 
              className="btn-gold text-center py-2.5 rounded text-xs font-semibold cursor-pointer animate-pulse" 
              onClick={() => setMobileOpen(false)}
            >
              Start Planning
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
