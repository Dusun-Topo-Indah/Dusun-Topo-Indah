"use client";

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/common/data-table";
import { PengaduanRow } from "@/types/sheets";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, ImageIcon, MoreHorizontal, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as React from "react";

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

function ActionCell({ row }: { row: { original: PengaduanRow } }) {
  const router = useRouter();
  const item = row.original;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
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
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none" disabled={isUpdating}>
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatusChange("Menunggu")}>
            Tandai &quot;Menunggu&quot;
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("Diproses")}>
            Tandai &quot;Diproses&quot;
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("Selesai")}>
            Tandai &quot;Selesai&quot;
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("Ditolak")} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            Tandai &quot;Ditolak&quot;
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const columns: ColumnDef<PengaduanRow>[] = [
  {
    accessorKey: "url_foto",
    header: "Bukti Foto",
    cell: ({ row }) => {
      const url = row.original.url_foto;
      return url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block relative w-16 h-12 rounded overflow-hidden border shrink-0 bg-muted">
          <Image src={url} alt="Cover" fill className="object-cover" sizes="64px" />
        </a>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border">
          <ImageIcon className="h-4 w-4 opacity-40" />
        </div>
      );
    },
  },
  {
    accessorKey: "nama_lengkap",
    header: "Pelapor",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-0.5">
          {row.original.nama_lengkap}
          {row.original.status_warga === "Warga Lokal" ? (
             <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 leading-none bg-blue-50 text-blue-600 border-blue-200 font-medium">Warga Lokal</Badge>
          ) : (
             <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 leading-none bg-orange-50 text-orange-600 border-orange-200 font-medium">Bukan Warga</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground block">{row.original.nik || "Tidak ada NIK"}</span>
        {row.original.no_hp && (
          <a href={`https://wa.me/${row.original.no_hp.replace(/^0/, '62').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline block mt-1 font-medium">
            {row.original.no_hp}
          </a>
        )}
      </div>
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
    accessorKey: "isi_laporan",
    header: "Laporan",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm line-clamp-2 max-w-[250px]" title={row.original.isi_laporan}>
        <FileText className="w-3 h-3 inline-block mr-1 opacity-50" />
        {row.original.isi_laporan}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge className={getStatusColor(row.original.status)} variant="outline">{row.original.status}</Badge>
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
    cell: ActionCell,
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
