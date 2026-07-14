"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { FasilitasRow } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, MapPin, Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DeletePetaButton } from "@/components/admin/peta/delete-peta-button"
import { DataTable } from "@/components/admin/common/data-table"
import { Badge } from "@/components/ui/badge"
import { getCategoryConfig } from "@/constants/peta"

export const columns: ColumnDef<FasilitasRow>[] = [
  {
    accessorKey: "url_foto",
    header: "Foto",
    cell: ({ row }) => {
      const url = row.original.url_foto
      return url ? (
        <div className="relative h-12 w-16 rounded overflow-hidden shrink-0 bg-muted">
          <Image src={url} alt="Foto Fasilitas" fill className="object-cover" sizes="64px" />
        </div>
      ) : (
        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted/50 text-muted-foreground shrink-0 border">
          <ImageIcon className="h-4 w-4 opacity-40" />
        </div>
      )
    },
  },
  {
    accessorKey: "kategori_ikon",
    header: "Kategori",
    cell: ({ row }) => {
      const category = row.original.kategori_ikon
      const config = getCategoryConfig(category)
      return (
        <Badge variant="outline" className="font-medium text-foreground bg-slate-50 flex items-center gap-1.5 w-fit">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "nama_fasum",
    header: "Fasilitas & Lokasi",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground text-sm line-clamp-1 max-w-[300px]">
          {row.original.nama_fasum || "Tanpa Nama"}
        </span>
        <span className="text-muted-foreground text-xs line-clamp-1 max-w-[300px] flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {row.original.latitude}, {row.original.longitude}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const fasilitas = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/peta/edit/${fasilitas.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title="Edit Fasilitas"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <DeletePetaButton
            id={fasilitas.id}
            triggerVariant="ghost"
            triggerClassName="h-8 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white"
          />
        </div>
      )
    },
  },
]

interface PetaTableProps {
  data: FasilitasRow[]
  emptyState?: React.ReactNode
}

export function PetaTable({ data, emptyState }: PetaTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  return <DataTable columns={columns} data={data} />
}
