"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-muted/50 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Gagal Memuat Halaman</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Terjadi gangguan sesaat saat mengambil data. Silakan coba muat ulang halaman ini.
      </p>
      <Button onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Coba Lagi
      </Button>
    </div>
  );
}
