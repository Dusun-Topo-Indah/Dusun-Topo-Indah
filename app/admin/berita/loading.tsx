import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function LoadingBeritaList() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Berita & Pengumuman" 
        description="Kelola artikel, berita, dan pengumuman untuk warga."
      />
      <TableSkeleton columnCount={5} rowCount={10} />
    </div>
  );
}
