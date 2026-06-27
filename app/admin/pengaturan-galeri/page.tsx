import { DashboardHeader } from "@/components/admin/dashboard-header";
import { PengaturanGaleriForm } from "@/components/admin/pengaturan-galeri-form";
import { getGlobalConfig } from "@/lib/google-sheets";

export const metadata = {
  title: "Pengaturan Galeri — SIG-Dusun Topo Indah",
};

export default async function PengaturanGaleriPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Halaman Galeri" 
        description="Kelola teks judul dan deskripsi pada header halaman galeri publik."
      />

      <PengaturanGaleriForm 
        globalConfig={globalConfig}
      />
    </div>
  );
}
