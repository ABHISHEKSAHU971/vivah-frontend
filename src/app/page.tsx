import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VenueTypeMarquee from "@/components/VenueTypeMarquee";
import FeaturesSection from "@/components/FeaturesSection";
import FeaturedVenues from "@/components/FeaturedVenues";
import AIConcierge from "@/components/AIConcierge";
import MarketplaceServices from "@/components/MarketplaceServices";
import Testimonial from "@/components/Testimonial";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Stick navbar to top */}
      <Navbar />

      {/* Main content flow */}
      <main className="flex-grow">
        {/* SEO JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "PlanMyVivah",
                "url": "https://www.planmyvivah.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.planmyvivah.com/venues?city={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "PlanMyVivah",
                "url": "https://www.planmyvivah.com",
                "logo": "https://www.planmyvivah.com/logo.png",
                "sameAs": [
                  "https://www.instagram.com/planmyvivah",
                  "https://www.pinterest.com/planmyvivah",
                  "https://www.facebook.com/planmyvivah"
                ]
              }
            ]),
          }}
        />

        {/* P0: Hero, search fields, stats */}
        <HeroSection />

        {/* P0: Horizontal infinite type marquee */}
        <VenueTypeMarquee />

        {/* P1: Core platform capabilities (6 grid cards) */}
        <FeaturesSection />

        {/* P1: Featured venues section (Fetches from API, falls back to static) */}
        <FeaturedVenues />

        {/* P1: AI planning concierge demo section (dark mockup) */}
        <AIConcierge />

        {/* P2: Other marketplaces: Catering, Decor, DJ */}
        <MarketplaceServices />

        {/* P2: Verified customer testimonials */}
        <Testimonial />

        {/* P2: High-contrast call to action */}
        <CTASection />
      </main>

      {/* Structured footer columns */}
      <Footer />
    </>
  );
}
