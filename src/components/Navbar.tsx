"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavLink {
  label: string;
  href: string | null;
  sub?: string[];
  badge?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Venues", href: "/venues" },
  { label: "Services", href: "/services", sub: ["Catering", "Decorations", "DJ & Sound"] },
  { label: "AI Planner", href: null, badge: "Coming Soon" },
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
        <Link href="/" className="flex items-center gap-2 select-none group">
          <svg
            width="34"
            height="34"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform duration-500 group-hover:rotate-12"
          >
            <defs>
              <linearGradient id="navbar-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F2D07C" />
                <stop offset="50%" stopColor="#C9A440" />
                <stop offset="100%" stopColor="#9C7721" />
              </linearGradient>
            </defs>
            <path
              d="M50 15 C35 30, 20 45, 20 60 C20 76.5, 33.5 90, 50 90 C66.5 90, 80 76.5, 80 60 C80 45, 65 30, 50 15 Z"
              stroke="url(#navbar-gold-grad)"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M50 30 C40 42, 32 55, 32 65 C32 75, 40 82, 50 82 C60 82, 68 75, 68 65 C68 55, 60 42, 50 30 Z"
              stroke="url(#navbar-gold-grad)"
              strokeWidth="3.5"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M50 45 C45 52, 40 60, 40 67 C40 73, 44 76, 50 76 C56 76, 60 73, 60 67 C60 60, 55 52, 50 45 Z"
              fill="url(#navbar-gold-grad)"
              opacity="0.9"
            />
            <circle cx="50" cy="62" r="3.5" fill={showSolidNavbar ? "var(--text-dark)" : "var(--white)"} className="transition-colors duration-300" />
          </svg>
          <span
            className="font-heading font-semibold tracking-tight transition-colors duration-300"
            style={{ 
              fontSize: "1.35rem",
              color: showSolidNavbar ? "var(--text-dark)" : "var(--white)" 
            }}
          >
            PlanMy<span style={{ color: "var(--gold)" }}>Vivah</span>
          </span>
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
