import { getGaleriListing } from "@/lib/google-sheets";

import Link from "next/link";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { EmptyState } from "@/components/admin/empty-state";
import { GaleriTable } from "./galeri-table";
import { ImageIcon } from "lucide-react";
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
        <Button render={<Link href="/admin/galeri/create" />} nativeButton={false} className="h-14 px-6 text-base">
          <ImageIcon className="mr-2 h-5 w-5" />
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

      <GaleriTable 
        data={galeriResult.items} 
        emptyState={
          <EmptyState 
            icon={ImageIcon}
            title="Galeri Masih Kosong"
            description="Belum ada foto di galeri. Klik &quot;Unggah Foto&quot; untuk menambahkan data."
            className="border border-dashed rounded-lg bg-muted/20"
          />
        } 
      />

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
