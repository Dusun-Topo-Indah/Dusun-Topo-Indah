"use client"

import { DeletePetaButton } from "@/components/admin/peta/delete-peta-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCategoryConfig } from "@/constants/peta"
import type { FasilitasRow } from "@/types"
import { MapPin, Pencil } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

interface PetaGridProps {
  data: FasilitasRow[]
  emptyState?: React.ReactNode
}

export function PetaGrid({ data, emptyState }: PetaGridProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {data.map((fasilitas) => {
        const config = getCategoryConfig(fasilitas.kategori_ikon)
        
        return (
          <Card key={fasilitas.id} className="flex flex-col overflow-hidden h-full border-border/60 shadow-sm hover:shadow-md transition-all bg-white rounded-none p-0 gap-0">
            <div className="relative aspect-video w-full bg-slate-50 border-b flex shrink-0 items-center justify-center">
              {fasilitas.url_foto ? (
                <Image 
                  src={fasilitas.url_foto} 
                  alt={fasilitas.nama_fasum} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <MapPin className="h-10 w-10 opacity-30" style={{ color: config.color }} />
                </div>
              )}
              <Badge variant="secondary" className="absolute top-3 left-3 shadow-sm border" style={{ backgroundColor: "white", color: config.color, borderColor: config.color }}>
                {fasilitas.kategori_ikon}
              </Badge>
            </div>
            
            <CardContent className="flex flex-col flex-1 px-4 py-3 justify-start items-start text-left">
              <h3 className="font-semibold text-[15px] line-clamp-2 mb-2 text-slate-800 leading-snug">
                {fasilitas.nama_fasum || "Tanpa Nama"}
              </h3>
              
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-start gap-1.5 text-[11px] text-slate-500 font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {fasilitas.latitude}, {fasilitas.longitude}
                  </span>
                </div>
                {fasilitas.deskripsi && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                    {fasilitas.deskripsi}
                  </p>
                )}
              </div>
            </CardContent>
            
            <div className="grid grid-cols-2 border-t bg-white shrink-0">
              <Link 
                href={`/admin/peta/edit/${fasilitas.id}`}
                className={buttonVariants({ variant: "ghost", className: "h-11 rounded-none text-slate-600 hover:text-blue-700 hover:bg-slate-50 font-medium text-xs uppercase tracking-wide" })}
                title="Edit Fasilitas"
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </Link>
              <DeletePetaButton 
                id={fasilitas.id} 
                triggerVariant="ghost"
                showText={true}
                triggerClassName="h-11 w-full rounded-none text-red-600 bg-red-50 hover:bg-red-600 hover:text-white font-medium text-xs uppercase tracking-wide"
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
