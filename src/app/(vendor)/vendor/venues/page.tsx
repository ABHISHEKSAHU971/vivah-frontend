"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function VendorVenuesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor/listings");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center font-body">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 size={32} className="animate-spin text-gold" />
        <p className="text-sm">Redirecting to unified listings panel...</p>
      </div>
    </div>
  );
}
