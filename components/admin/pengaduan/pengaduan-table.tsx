"use client";

import { DataTable } from "@/components/admin/common/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PengaduanRow } from "@/lib/db/queries/pengaduan";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
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

function StatusCell({ row }: { row: { original: PengaduanRow } }) {
  const router = useRouter();
  const item = row.original;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    if (newStatus === item.status) return;
    
    setIsUpdating(true);
    toast.loading(`Mengubah status menjadi ${newStatus}...`, { id: "updating" });

    try {
      const res = await fetch(`/api/pengaduan?id=${item.id}`, {
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
    <div className="flex items-center">
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
      ) : null}
      <Select 
        defaultValue={item.status || "Menunggu"} 
        onValueChange={handleStatusChange} 
        disabled={isUpdating}
      >
        <SelectTrigger className={`h-8 border-none text-xs font-semibold ring-0 focus:ring-0 cursor-pointer ${getStatusColor(item.status || "Menunggu")}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Menunggu">Menunggu</SelectItem>
          <SelectItem value="Diproses">Diproses</SelectItem>
          <SelectItem value="Selesai">Selesai</SelectItem>
          <SelectItem value="Ditolak">Ditolak</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const columns: ColumnDef<PengaduanRow>[] = [
  {
    accessorKey: "nama_lengkap",
    header: "Pelapor",
    cell: ({ row }) => (
      <span className="font-medium text-sm text-foreground">
        {row.original.nama_lengkap}
      </span>
    ),
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.kategori}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: StatusCell
  },
  {
    accessorKey: "tanggal",
    header: "Waktu",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        {new Date(row.original.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="text-right flex justify-end">
        <Link href={`/admin/pengaduan/${row.original.id}`}>
          <Button variant="outline" size="sm" className="h-8 border-primary hover:bg-primary/10 text-primary hover:text-primary">
            <Eye className="w-4 h-4 mr-1.5" /> Detail
          </Button>
        </Link>
      </div>
    ),
  },
];

interface PengaduanTableProps {
  data: PengaduanRow[];
  emptyState?: React.ReactNode;
}

export function PengaduanTable({ data, emptyState }: PengaduanTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  return <DataTable columns={columns} data={data} />;
}
