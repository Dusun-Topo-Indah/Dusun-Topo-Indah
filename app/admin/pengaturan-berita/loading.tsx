import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPengaturanBerita() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Halaman Berita" 
        description="Kelola teks narasi yang tampil di halaman utama berita."
      />
      <FormSkeleton />
    </div>
  );
}
