"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

export interface VenuePhoto {
  id: number;
  image: string;
  folder: string;
  caption?: string;
  is_primary?: boolean;
}

/** Folder codes come from VenueImage.FOLDER_CHOICES on the backend. */
const FOLDER_LABELS: Record<string, string> = {
  hall: "Banquet Hall",
  rooms: "Rooms",
  garden: "Garden",
  pool: "Pool",
  dormitory: "Dormitory",
  general: "General",
  other: "Other",
};

/** Order the tabs the way a couple shops: the spaces first, extras after. */
const FOLDER_ORDER = ["hall", "garden", "rooms", "pool", "dormitory", "general", "other"];

export default function VenueGallery({
  photos,
  venueName,
}: {
  photos: VenuePhoto[];
  venueName: string;
}) {
  const [folder, setFolder] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Tabs are built from what this venue actually has — no empty "Pool (0)".
  const folderTabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of photos) counts.set(p.folder, (counts.get(p.folder) || 0) + 1);
    return FOLDER_ORDER.filter((f) => counts.has(f)).map((f) => ({
      code: f,
      label: FOLDER_LABELS[f] || f,
      count: counts.get(f)!,
    }));
  }, [photos]);

  const visible = useMemo(
    () => (folder === "all" ? photos : photos.filter((p) => p.folder === folder)),
    [photos, folder]
  );

  if (photos.length === 0) return null;

  const [lead, ...rest] = visible;
  const tiles = rest.slice(0, 3);
  const hiddenCount = Math.max(0, visible.length - 4);

  const step = (delta: number) => {
    setLightboxIndex((prev) => {
      if (prev === null) return prev;
      return (prev + delta + visible.length) % visible.length;
    });
  };

  return (
    <>
      <section className="space-y-3">
        {/* ── Mosaic: one lead shot, three supporting ─────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="relative h-64 sm:h-[26rem] rounded-2xl overflow-hidden bg-gray-100 group"
          >
            <Image
              src={lead.image}
              alt={lead.caption || venueName}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
              priority
            />
          </button>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 h-64 sm:h-[26rem]">
            {tiles.map((photo, i) => {
              const isLastTile = i === tiles.length - 1 && hiddenCount > 0;
              // A single supporting shot spans the full width rather than
              // leaving an empty column.
              const spanFull = tiles.length === 1;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(i + 1)}
                  className={`relative rounded-2xl overflow-hidden bg-gray-100 group ${
                    spanFull ? "col-span-2" : ""
                  } ${tiles.length === 3 && i === 2 ? "col-span-2" : ""}`}
                >
                  <Image
                    src={photo.image}
                    alt={photo.caption || venueName}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    unoptimized
                  />
                  {isLastTile && (
                    <span className="absolute inset-0 bg-black/55 text-white text-sm font-semibold flex items-center justify-center backdrop-blur-[1px]">
                      +{hiddenCount} Photos
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Photo-type filter ───────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs text-gray-500 shrink-0">
            Showing <strong className="text-gray-900">{visible.length}</strong> of {photos.length} photos
          </p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFolder("all")}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                folder === "all"
                  ? "bg-[#050D1A] text-white border-[#050D1A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Images size={12} /> All Photos
              <span className={folder === "all" ? "text-white/60" : "text-gray-400"}>{photos.length}</span>
            </button>
            {folderTabs.map(({ code, label, count }) => (
              <button
                key={code}
                onClick={() => setFolder(code)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  folder === code
                    ? "bg-[#050D1A] text-white border-[#050D1A]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {label}
                <span className={`ml-1.5 ${folder === code ? "text-white/60" : "text-gray-400"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[110] bg-black/92 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close gallery"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          {visible.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <figure
            className="relative w-[92vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={visible[lightboxIndex].image}
              alt={visible[lightboxIndex].caption || venueName}
              fill
              className="object-contain"
              unoptimized
            />
            <figcaption className="absolute -bottom-8 left-0 right-0 text-center text-xs text-white/70">
              {visible[lightboxIndex].caption ||
                FOLDER_LABELS[visible[lightboxIndex].folder] ||
                venueName}
              <span className="text-white/40"> · {lightboxIndex + 1} / {visible.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
