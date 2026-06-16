const VENUE_TYPES = [
  "Wedding Gardens",
  "Banquet Halls",
  "Luxury Resorts",
  "Farmhouses",
  "Heritage Hotels",
  "Rooftop Venues",
  "Convention Centers",
  "Palace Venues",
  "Garden Lawns",
  "Barat Ghars",
  "Beach Venues",
  "Dharamshalas",
];

const Diamond = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <rect x="4" y="0" width="5.66" height="5.66" rx="0.5" transform="rotate(45 4 0)" fill="#C9A440" opacity="0.6" />
  </svg>
);

export default function VenueTypeMarquee() {
  return (
    <div
      className="py-4 overflow-hidden"
      style={{ borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div className="marquee-track">
        {/* Main List */}
        <div className="flex items-center">
          {VENUE_TYPES.map((type, i) => (
            <span key={i} className="flex items-center gap-3 mx-6 whitespace-nowrap">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
              >
                {type}
              </span>
              <Diamond />
            </span>
          ))}
        </div>
        
        {/* Duplicated List for Loop (Aria Hidden) */}
        <div className="flex items-center animate-marquee" aria-hidden="true">
          {VENUE_TYPES.map((type, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-3 mx-6 whitespace-nowrap">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
              >
                {type}
              </span>
              <Diamond />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

