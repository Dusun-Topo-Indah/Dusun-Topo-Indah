"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function getStatusColor(status: string) {
  switch (status) {
    case "Menunggu":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Diproses":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Selesai":
      return "bg-green-100 text-green-800 border-green-200";
    case "Ditolak":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

interface StatusUpdaterDetailProps {
  id: string;
  currentStatus: string;
}

export function StatusUpdaterDetail({ id, currentStatus }: StatusUpdaterDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus || newStatus === currentStatus) return;
    
    setIsUpdating(true);
    toast.loading(`Mengubah status menjadi ${newStatus}...`, { id: "updating" });

    try {
      const res = await fetch(`/api/pengaduan?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      toast.dismiss("updating");

      if (result.success) {
        toast.success("Status berhasil diperbarui");
        router.refresh();
      } else {
        toast.error(result.message || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.dismiss("updating");
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full mt-8 flex flex-col gap-2">
      <Select 
        defaultValue={currentStatus} 
        onValueChange={handleStatusChange} 
        disabled={isUpdating}
      >
        <SelectTrigger 
          className={`w-full h-14 text-base font-bold transition-all relative cursor-pointer ${getStatusColor(currentStatus)}`}
        >
          {isUpdating && <Loader2 className="h-5 w-5 animate-spin absolute left-4" />}
          <SelectValue className="justify-center text-center w-full" />
        </SelectTrigger>
        <SelectContent align="center" className="w-full min-w-[300px]">
          <SelectItem value="Menunggu" className="font-medium text-center py-3">Menunggu</SelectItem>
          <SelectItem value="Diproses" className="font-medium text-center py-3">Diproses</SelectItem>
          <SelectItem value="Selesai" className="font-medium text-center py-3">Selesai</SelectItem>
          <SelectItem value="Ditolak" className="font-medium text-center py-3">Ditolak</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
