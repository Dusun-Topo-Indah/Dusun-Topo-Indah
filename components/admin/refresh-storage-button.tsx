"use client";

import { refreshStorageCache } from "@/app/admin/actions";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function RefreshStorageButton() {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await refreshStorageCache();
        toast.success("Kapasitas penyimpanan berhasil diperbarui");
      } catch {
        toast.error("Gagal memperbarui kapasitas penyimpanan");
      }
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      title="Refresh Kapasitas"
      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-1 disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin text-primary' : ''}`} />
    </button>
  );
}
