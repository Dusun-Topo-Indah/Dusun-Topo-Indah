"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function StorageManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCleanup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cloudinary/cleanup", { method: "POST" });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message, {
          description: `Waktu eksekusi: ${data.executionTimeMs}ms`,
        });
      } else {
        toast.error(data.message || "Gagal melakukan pembersihan media.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleCleanup} 
      disabled={isLoading}
      className="w-full h-12 px-6"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memindai & Membersihkan...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Pindai & Bersihkan Media Sampah
        </>
      )}
    </Button>
  );
}

