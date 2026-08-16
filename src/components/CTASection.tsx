"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden" style={{ background: "var(--navy)" }}>
      {/* Subtle light spots */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-border to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
        <p className="eyebrow text-gold">Start Your Journey</p>
        
        <h2 className="font-heading text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", lineHeight: 1.15 }}>
          Begin a celebration <br />
          <em style={{ color: "var(--gold)", fontStyle: "italic" }}>worth remembering</em>.
        </h2>

        <p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Whether you are booking a single wedding lawn or designing a five-day luxury shaadi, our verified service partners and planning tools are ready.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link href="/venues" className="btn-gold w-full sm:w-auto text-center justify-center">
            Explore Curated Venues <ArrowRight size={15} />
          </Link>
          <Link href="/services/catering" className="btn-ghost w-full sm:w-auto text-center justify-center">
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  );
}
