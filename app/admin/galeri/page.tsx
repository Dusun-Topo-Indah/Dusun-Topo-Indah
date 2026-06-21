import { getGaleriList } from "@/lib/google-sheets";
import { GaleriForm } from "@/components/admin/galeri-form";
import { DeleteGaleriButton } from "@/components/admin/delete-galeri-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ImageIcon } from "lucide-react";

export const metadata = {
  title: "Galeri — Dusun Topo Indah",
};

export default async function AdminGaleriPage() {
  const galeriList = await getGaleriList();
  
  const existingCategories = Array.from(new Set(galeriList.map(g => g.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Galeri" 
        description="Kelola foto kegiatan, fasilitas, dan momen penting di dusun."
      >
        <GaleriForm existingCategories={existingCategories} />
      </DashboardHeader>

      {galeriList.length === 0 ? (
        <EmptyState 
          icon={ImageIcon}
          title="Galeri Masih Kosong"
          description="Belum ada foto di galeri. Klik &quot;Unggah Foto&quot; untuk menambahkan data."
          className="border border-dashed rounded-lg bg-muted/20"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galeriList.map((item) => (
            <Card key={item.id} className="overflow-hidden group relative border-0 shadow-sm aspect-square w-full">
              <Image 
                src={item.url_foto} 
                alt={item.caption || "Foto galeri"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10 pointer-events-none">
                <p className="text-white text-sm font-medium line-clamp-2">{item.caption || "Tanpa caption"}</p>
                <p className="text-white/80 text-xs mt-1">
                  {new Date(item.tanggal_upload).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <DeleteGaleriButton id={item.id} />
              </div>
              <Badge className="absolute top-2 left-2 z-20 pointer-events-none bg-background/80 text-foreground hover:bg-background/90 backdrop-blur-sm border-0">
                {item.kategori}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
