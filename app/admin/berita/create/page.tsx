import { BeritaForm } from "@/components/admin/berita-form";
import { SetBreadcrumb } from "@/components/admin/breadcrumb-context";

export const metadata = {
  title: "Tulis Berita Baru — Dusun Topo Indah",
};

export default function CreateBeritaPage() {
  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tulis Berita Baru" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tulis Berita Baru</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buat artikel untuk mempublikasikan kegiatan atau pengumuman dusun.
        </p>
      </div>

      <BeritaForm />
    </div>
  );
}
