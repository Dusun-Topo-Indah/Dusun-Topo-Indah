import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPengaturanBeranda() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Beranda" 
        description="Kelola teks dan gambar yang tampil di halaman utama website."
      />
      <FormSkeleton />
    </div>
  );
}
