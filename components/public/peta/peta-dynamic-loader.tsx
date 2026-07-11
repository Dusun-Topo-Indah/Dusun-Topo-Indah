"use client";

import type { FasilitasRow } from "@/types";
import dynamic from "next/dynamic";

const PetaClientWrapper = dynamic(
  () =>
    import("@/components/public/peta/peta-client-wrapper").then(
      (mod) => mod.PetaClientWrapper
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-slate-50" style={{ marginTop: "5rem" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat peta...</p>
        </div>
      </div>
    ),
  }
);

interface PetaDynamicLoaderProps {
  fasilitas: FasilitasRow[];
}

export function PetaDynamicLoader({ fasilitas }: PetaDynamicLoaderProps) {
  return <PetaClientWrapper fasilitas={fasilitas} />;
}
