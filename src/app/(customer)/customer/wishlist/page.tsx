"use client";

import { useStore } from "@/store/store";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function CustomerWishlist() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-gray-900">Saved Lists</h1>
        <p className="text-xs text-gray-400 mt-1">Venues and service partners you are currently comparing</p>
      </div>

      <hr className="border-gray-100" />

      {/* Empty State placeholder */}
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mx-auto">
          <Heart size={20} />
        </div>
        <p className="text-xs text-gray-400">No items saved yet. Start exploring gardens to build your list!</p>
        <div className="pt-2">
          <Link href="/venues" className="btn-gold text-xs py-2 px-4 rounded-lg inline-flex">
            Browse Venues
          </Link>
        </div>
      </div>
    </div>
  );
}
