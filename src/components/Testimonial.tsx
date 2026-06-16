"use client";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "PlanMyVivah ne hamare sapno ki shaadi ko haqeekat mein badal diya. Finding a premium venue in Bhopal that checked all our criteria was just a few clicks away. The catering and decorations were perfect!",
    author: "Priya & Raj Sharma",
    location: "Married in Bhopal",
    date: "February 2026"
  },
  {
    quote: "We were overwhelmed with vendors, but PlanMyVivah's verified listings made sorting through halls and lawns in Indore extremely straightforward. Highly recommended for any family planning a wedding.",
    author: "Ananya & Rohan Verma",
    location: "Married in Indore",
    date: "April 2026"
  }
];

export default function Testimonial() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="eyebrow mb-4">Loved By Families</p>
          <h2 className="font-heading" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--text-dark)", lineHeight: 1.2 }}>
            Real stories, <br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>beautiful</em> beginnings.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="relative p-8 rounded-2xl bg-zinc-50/50 border border-gray-100 flex flex-col justify-between">
              {/* Quote Mark */}
              <div className="absolute top-6 right-6 text-gold/20">
                <Quote size={40} className="fill-current" />
              </div>

              <blockquote className="font-heading text-lg italic text-gray-700 leading-relaxed pr-8">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center gap-3">
                {/* Initials avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium bg-gold text-navy text-sm shrink-0">
                  {t.author.split(" & ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{t.author}</h4>
                  <p className="text-xs text-gray-500">
                    {t.location} • {t.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
