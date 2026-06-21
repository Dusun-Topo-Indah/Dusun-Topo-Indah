import { notFound } from "next/navigation";
import { getBeritaList } from "@/lib/google-sheets";
import { BeritaForm } from "@/components/admin/berita-form";
import { SetBreadcrumb } from "@/components/admin/breadcrumb-context";

export const metadata = {
  title: "Edit Berita — Dusun Topo Indah",
};

export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beritaList = await getBeritaList();
  const berita = beritaList.find((b) => b.id === id);

  if (!berita) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label={berita.judul} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Berita</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Perbarui informasi atau naskah berita yang sudah diterbitkan.
        </p>
      </div>

      <BeritaForm initialData={berita} />
    </div>
  );
}
