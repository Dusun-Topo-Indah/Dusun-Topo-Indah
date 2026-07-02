"use client"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PengaduanRow } from "@/types/sheets"
import { CalendarDays, Eye, FileText, User } from "lucide-react"
import Link from "next/link"
import * as React from "react"

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

interface PengaduanGridProps {
  data: PengaduanRow[]
  emptyState?: React.ReactNode
}

export function PengaduanGrid({ data, emptyState }: PengaduanGridProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {data.map((pengaduan) => (
        <Card key={pengaduan.id} className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-white rounded-none p-0 gap-0">
          <CardContent className="flex flex-col flex-1 px-5 py-4 justify-start items-start text-left relative">
            <Badge variant="outline" className={`absolute top-4 right-4 text-[10px] px-2 py-0.5 leading-none font-medium ${getStatusColor(pengaduan.status)}`}>
              {pengaduan.status}
            </Badge>
            
            <div className="text-xs font-semibold mb-2 uppercase tracking-wider pr-20">
              {pengaduan.kategori}
            </div>
            
            <div className="flex items-center gap-2 mb-3 w-full">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{pengaduan.nama_lengkap}</span>
                <span className="text-xs text-slate-500 flex items-center">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {new Date(pengaduan.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>

            <div className="text-sm text-slate-600 line-clamp-3 mt-1 pl-1 border-l-2 border-slate-100 w-full relative">
              <FileText className="h-3 w-3 absolute -left-[7px] top-1 text-slate-300 bg-white" />
              <span className="pl-3 block">
                {pengaduan.isi_laporan}
              </span>
            </div>
          </CardContent>
          <div className="grid grid-cols-1 border-t bg-white shrink-0">
            <Link 
              href={`/admin/pengaduan/${pengaduan.id}`}
              className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-primary hover:text-blue-700 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wide" })}
              title="Detail Pengaduan"
            >
              <Eye className="h-4 w-4 mr-2" />
              Detail
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}
