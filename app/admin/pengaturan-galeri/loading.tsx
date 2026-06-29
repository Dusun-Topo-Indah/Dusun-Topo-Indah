import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPengaturanGaleri() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Halaman Galeri" 
        description="Kelola teks narasi yang tampil di halaman utama galeri."
      />
      <FormSkeleton />
    </div>
  );
}
