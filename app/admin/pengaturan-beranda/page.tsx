import { DashboardHeader } from "@/components/admin/dashboard-header";
import { PengaturanBerandaForm } from "@/components/admin/pengaturan-beranda-form";

export const metadata = {
  title: "Pengaturan Beranda — SIG-Dusun Topo Indah",
};

export default function PengaturanBerandaPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Beranda" 
        description="Kelola teks dan gambar yang tampil di halaman utama website."
      />

      <PengaturanBerandaForm />
    </div>
  );
}
