import Link from "next/link";
import Image from "next/image";
import { PlusCircle, ImageIcon, CalendarDays, Inbox, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBeritaList } from "@/lib/google-sheets";
import { DeleteBeritaButton } from "@/components/admin/delete-berita-button";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { EmptyState } from "@/components/admin/empty-state";
import type { BeritaRow } from "@/types";

export const metadata = {
  title: "Manajemen Berita — SIG-Dusun Topo Indah",
};

const columns: ColumnDef<BeritaRow>[] = [
  {
    header: "Informasi Berita",
    cell: (berita) => (
      <div className="flex items-start gap-4 py-2">
        {berita.url_foto ? (
          <div className="relative h-18 w-28 rounded-md overflow-hidden shrink-0 border bg-muted">
            <Image 
              src={berita.url_foto} 
              alt={berita.judul} 
              fill 
              className="object-cover" 
              sizes="112px" 
            />
          </div>
        ) : (
          <div className="flex h-18 w-28 items-center justify-center rounded-md bg-muted/50 text-muted-foreground shrink-0 border">
            <ImageIcon className="h-6 w-6 opacity-40" />
          </div>
        )}
        <div className="flex flex-col gap-1.5 max-w-[600px]">
          <span className="font-semibold text-base line-clamp-1 leading-tight text-foreground">
            {berita.judul}
          </span>
          <span className="text-sm text-muted-foreground line-clamp-1 leading-snug">
            {berita.ringkasan || "Tidak ada ringkasan yang ditulis."}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(berita.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: "Aksi",
    headerClassName: "w-[150px] text-right",
    className: "text-right align-middle",
    cell: (berita) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/admin/berita/edit/${berita.id}`} />} nativeButton={false} title="Edit Berita">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <DeleteBeritaButton id={berita.id} judul={berita.judul} />
      </div>
    ),
  },
];

export default async function BeritaPage() {
  const beritaList = await getBeritaList();

  const emptyState = (
    <EmptyState 
      icon={Inbox}
      title="Belum ada berita"
      description="Belum ada berita yang diterbitkan."
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Kabar Dusun (Berita)" 
        description="Kelola publikasi artikel berita dan pengumuman untuk warga."
      >
        <Button render={<Link href="/admin/berita/create" />} nativeButton={false}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tulis Berita
        </Button>
      </DashboardHeader>

      <DataTable 
        data={beritaList} 
        columns={columns} 
        emptyState={emptyState} 
      />
    </div>
  );
}
