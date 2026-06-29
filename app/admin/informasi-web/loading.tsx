import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingInformasiWeb() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Informasi Website" 
        description="Kelola informasi umum website seperti logo, favicon, kontak, dan tautan sosial media."
      />
      <FormSkeleton />
    </div>
  );
}
