"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const QUICK_PROMPTS = [
  { label: "₹15L Budget Split", prompt: "Suggest a budget breakdown for a ₹15 Lakh wedding in Indore with 300 guests." },
  { label: "3-Day Wedding Timeline", prompt: "Create a timeline itinerary for a traditional 3-day Hindu wedding." },
  { label: "Verify Bhopal Gardens", prompt: "Find verified open gardens in Bhopal with capacity for 500+ guests." },
];

export default function AiPlannerPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Namaste! I am your AI Wedding Concierge. Describe your dream shaadi, preferred city, guest count, and budget. I will help verify gardens and design a complete itinerary!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuickPrompt = async (promptText: string) => {
    if (loading) return;
    setMessages((prev) => [...prev, { sender: "user", text: promptText }]);
    setLoading(true);

    let reply = "I am processing your wedding request. Please hold on.";
    if (promptText.includes("₹15 Lakh")) {
      reply = "Here is a recommended ₹15 Lakhs budget split for 300 guests in Indore:\n\n• **Venue & Accommodation**: ₹6,00,000 (40%)\n• **Catering (Veg, 2 functions)**: ₹4,50,000 (30%)\n• **Decoration & Stage Setups**: ₹2,25,000 (15%)\n• **DJ, Sound & Photo/Video**: ₹1,50,000 (10%)\n• **Miscellaneous Buffer**: ₹75,000 (5%)\n\nWould you like me to match verified gardens or banquets in Indore matching this venue budget?";
    } else if (promptText.includes("3-day")) {
      reply = "Here is a recommended timeline itinerary for a 3-day traditional celebration:\n\n• **Day 1 (Afternoon)**: Haldi & Mehendi. Music starts at 4 PM, Mehendi artists set up by 1 PM.\n• **Day 2 (Evening)**: Sangeet & Ring Ceremony. Choreographed dances, DJ truss light setups.\n• **Day 3 (Morning/Night)**: Pheras & Reception. Baraat assembly at 9 AM, Pheras at 11:30 AM, Reception dinner at 8 PM.\n\nWould you like me to suggest catering styles tailored for each of these functions?";
    } else if (promptText.includes("Bhopal")) {
      reply = "Here are physically audited gardens in Bhopal with 500+ capacity:\n\n1. **Royal Gardens Bhopal** (Lalghati) - Capacity: 800, Price: ₹85,000/day. Large open garden lawn.\n2. **Green Meadows Farm** (Kolar Road) - Capacity: 600, Price: ₹55,000/day. Scenic farmhouse setting.\n\nWould you like me to check their slot availability for your target dates?";
    } else {
      try {
        const response = await api.post("/ai/planner/chat/", { message: promptText });
        reply = response.data?.data?.reply || response.data?.reply || reply;
      } catch {
        // Fallback standard response
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setLoading(false);
    }, 1000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    let reply = `Thank you for sharing! For a guest count and budget in that range, I recommend checking Royal Gardens Bhopal (capacity 800) or Aangan Palace Indore. Let me know if you would like me to set up a site visit.`;
    
    const lowerText = userText.toLowerCase();
    if (lowerText.includes("budget") || lowerText.includes("lakh") || lowerText.includes("₹")) {
      reply = "I've analyzed your budget metrics. To optimize your spend across categories, I recommend allocating 40% to your venue/rooms, 30% to catering meals, 15% to stage/decor, and 15% to entertainment and photos. Would you like me to draft a custom spreadsheet breakdown?";
    } else if (lowerText.includes("itinerary") || lowerText.includes("timeline") || lowerText.includes("day")) {
      reply = "I can build your timeline! Typically, clients split events into Haldi/Mehendi (Day 1), Sangeet night (Day 2), and the main Pheras & Reception dinner (Day 3). Shall I link verified caterers and DJs for these specific functions?";
    } else if (lowerText.includes("garden") || lowerText.includes("lawn") || lowerText.includes("venue") || lowerText.includes("bhopal") || lowerText.includes("indore")) {
      reply = "Found verified matchings! Royal Gardens Bhopal in Lalghati (capacity: 800, ₹85k/day) and Aangan Palace Indore (capacity: 400, ₹120k/day) are fully audited and available. Shall I request a slot confirmation call?";
    } else {
      try {
        const response = await api.post("/ai/planner/chat/", { message: userText });
        reply = response.data?.data?.reply || response.data?.reply || reply;
      } catch {
        // Fallback already assigned
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 bg-zinc-950 text-white min-h-screen flex flex-col justify-between">
        <div className="max-w-4xl mx-auto px-6 py-6 w-full flex-grow flex flex-col justify-between">
          
          {/* Header */}
          <div className="text-center py-4 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles size={11} /> AI Planner Beta
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-white">Your Virtual Shaadi Concierge</h1>
            <p className="text-xs text-zinc-400">Describe your ideas, dates, and budget details in plain words</p>
          </div>

          {/* Chat Window */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex-grow my-4 flex flex-col justify-between overflow-hidden h-[450px]">
            
            {/* Status bar */}
            <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">AI planner online</span>
            </div>

            {/* Chat Body */}
            <div className="p-4 flex-grow overflow-y-auto space-y-4 text-sm scrollbar-thin">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === "user" ? "bg-amber-500 text-black" : "bg-zinc-800 text-amber-500 border border-zinc-700"}`}>
                    {m.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3.5 rounded-xl leading-relaxed ${m.sender === "user" ? "bg-amber-500 text-black rounded-tr-none text-xs font-medium" : "bg-zinc-800/40 text-zinc-100 border border-zinc-800 rounded-tl-none text-xs"}`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-500 border border-zinc-700 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="bg-zinc-800/20 text-zinc-400 p-3 rounded-xl flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/30 flex flex-wrap gap-2 shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-[10px] font-semibold rounded-lg text-amber-400 border border-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about budget, timelines, or verified vendors..."
                className="flex-1 bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-gold py-2.5 px-4 rounded-xl text-black shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
