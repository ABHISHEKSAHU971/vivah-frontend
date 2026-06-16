"use client";
import { useState, useEffect } from "react";
import { Sparkles, MessageSquare, Check, ArrowRight } from "lucide-react";

const MOCK_MESSAGES = [
  { sender: "user", text: "Suggest a wedding garden in Bhopal with capacity for 500 guests and budget around ₹8 Lakhs." },
  { sender: "ai", text: "Sure! Based on your criteria, Royal Gardens Bhopal in Lalghati (capacity: 800, price: ₹85,000/day) matches perfectly. It has excellent parking and open garden space. Would you like to check availability for February 2026?" },
  { sender: "user", text: "Yes, and suggest a pure veg caterer for the Tilak and Mehendi functions too." },
  { sender: "ai", text: "Found 'Annapurna Caterers' (Pure Veg, ₹450/plate). They specialize in traditional Rajasthani and Gujarati counters, perfect for Mehendi/Tilak!" }
];

export default function AIConcierge() {
  const [activeMessage, setActiveMessage] = useState(0);

  // Auto scroll messages for the mockup
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % (MOCK_MESSAGES.length + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const bullets = [
    "Personalized venue & vendor matches for your city",
    "Real-time budget optimization in Indian Rupees (INR)",
    "Checklists customized for Mehendi, Sangeet, Shaadi & Reception",
    "Direct chat & quote requests synced automatically"
  ];

  return (
    <section className="py-24" style={{ background: "var(--navy-mid)" }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full eyebrow" style={{ background: "var(--gold-muted)", border: "1px solid var(--gold-border)" }}>
            <Sparkles size={12} className="text-gold" />
            <span>Beta — Launching Soon</span>
          </div>

          <h2 className="font-heading text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}>
            Conversation in. <br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Complete plan</em> out.
          </h2>

          <p className="text-white/70 max-w-lg leading-relaxed">
            Meet your personal AI Planner. Simply describe your dream wedding in plain words, and watch as it designs your itinerary, drafts your budget, and pairs you with the perfect local vendors.
          </p>

          <div className="space-y-3.5 pt-4">
            {bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                  <Check size={12} />
                </div>
                <span className="text-white/80 text-sm">{bullet}</span>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button className="btn-gold">
              Get Early Access <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Side: Chat Mockup */}
        <div className="relative">
          {/* Decorative gradients */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-600/30 to-amber-500/10 blur-xl opacity-75" />
          
          <div className="relative rounded-2xl overflow-hidden border" style={{ background: "var(--navy)", borderColor: "rgba(201, 164, 64, 0.25)" }}>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(5,13,26,0.5)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold text-navy font-semibold text-sm">
                PM
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">AI Wedding Planner</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/40 text-[10px] uppercase font-semibold tracking-wider">Online & Ready</span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-5 h-[340px] overflow-y-auto space-y-4 flex flex-col justify-end">
              {MOCK_MESSAGES.slice(0, activeMessage === 0 ? 1 : activeMessage).map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] rounded-lg p-3 text-xs leading-relaxed transition-all duration-300 ${
                    msg.sender === "user"
                      ? "bg-white/5 text-white ml-auto rounded-tr-none"
                      : "text-white/95 mr-auto rounded-tl-none"
                  }`}
                  style={
                    msg.sender === "ai"
                      ? {
                          background: "linear-gradient(135deg, rgba(201,164,64,0.1) 0%, rgba(201,164,64,0.02) 100%)",
                          border: "1px solid rgba(201,164,64,0.15)"
                        }
                      : {}
                  }
                >
                  <span className="text-[9px] font-semibold uppercase tracking-wider mb-1 opacity-40">
                    {msg.sender === "user" ? "You" : "PlanMyVivah AI"}
                  </span>
                  <p>{msg.text}</p>
                </div>
              ))}
              
              {activeMessage === 0 && (
                <div className="flex items-center gap-1 text-white/40 text-[11px] italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="ml-1">Planner is typing...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t flex gap-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <input
                type="text"
                disabled
                placeholder="Ask about venues, catering, decoration costs..."
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
              />
              <button disabled className="btn-gold py-2 px-3 rounded opacity-50 cursor-not-allowed">
                <MessageSquare size={14} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
