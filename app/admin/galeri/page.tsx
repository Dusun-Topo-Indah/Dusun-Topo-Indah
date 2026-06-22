import { getGaleriListing } from "@/lib/google-sheets";
import { DeleteGaleriButton } from "@/components/admin/delete-galeri-button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { EmptyState } from "@/components/admin/empty-state";
import { Edit, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingToolbar } from "@/components/admin/listing-toolbar";
import { ListingPagination } from "@/components/admin/listing-pagination";
import { DEFAULT_PAGE_LIMITS, toPositiveInteger } from "@/lib/listing";

export const metadata = {
  title: "Galeri — Dusun Topo Indah",
};

interface GaleriPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminGaleriPage({ searchParams }: GaleriPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "all";
  const page = toPositiveInteger(
    typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined,
    1
  );
  const limit = toPositiveInteger(
    typeof resolvedSearchParams.limit === "string" ? resolvedSearchParams.limit : undefined,
    DEFAULT_PAGE_LIMITS.galeri
  );

  const galeriResult = await getGaleriListing({
    q,
    filter,
    page,
    limit,
  });

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Galeri" 
        description="Kelola foto kegiatan, fasilitas, dan momen penting di dusun."
      >
        <Button render={<Link href="/admin/galeri/create" />} nativeButton={false}>
          Unggah Foto
        </Button>
      </DashboardHeader>

      <ListingToolbar
        searchPlaceholder="Cari kategori atau caption foto..."
        searchValue={q}
        activeFilter={filter}
        filterOptions={[
          { label: "Semua", value: "all" },
          ...galeriResult.categories.map((category) => ({ label: category, value: category })),
        ]}
        currentLimit={limit}
        currentPage={galeriResult.page}
      />

      {galeriResult.items.length === 0 ? (
        <EmptyState 
          icon={ImageIcon}
          title="Galeri Masih Kosong"
          description="Belum ada foto di galeri. Klik &quot;Unggah Foto&quot; untuk menambahkan data."
          className="border border-dashed rounded-lg bg-muted/20"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galeriResult.items.map((item) => (
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
              <div className="absolute top-2 right-2 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="secondary" size="icon" render={<Link href={`/admin/galeri/edit/${item.id}`} aria-label="Edit foto galeri" />} nativeButton={false}>
                  <Edit className="h-4 w-4" />
                </Button>
                <DeleteGaleriButton id={item.id} />
              </div>
              <Badge className="absolute top-2 left-2 z-20 pointer-events-none bg-background/80 text-foreground hover:bg-background/90 backdrop-blur-sm border-0">
                {item.kategori}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      <ListingPagination
        pathname="/admin/galeri"
        query={{ q, filter, page: galeriResult.page, limit }}
        page={galeriResult.page}
        totalPages={galeriResult.totalPages}
        totalItems={galeriResult.totalItems}
        limitOptions={[12, 24, 48]}
        currentLimit={limit}
      />
    </div>
  );
}
