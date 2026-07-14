"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const PetaLocationPickerDynamic = dynamic(
  () =>
    import("@/components/admin/peta/peta-location-picker").then(
      (mod) => mod.PetaLocationPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full items-center justify-center bg-slate-50 rounded-md border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    ),
  }
);
