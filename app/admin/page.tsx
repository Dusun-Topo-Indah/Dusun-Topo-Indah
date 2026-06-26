
import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Beranda</h1>
        <p className="text-gray-500 mt-2">Ringkasan informasi Sistem Informasi Geografis Dusun Topo Indah.</p>
      </div>

      <div className="grid gap-6 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="text-sm font-medium text-primary">Selamat Datang</h3>
            <LayoutDashboard className="h-4 w-4 text-primary/60" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">Admin Dashboard</div>
            <p className="text-xs text-muted-foreground mt-2">
              Gunakan menu di sebelah kiri untuk mengelola konten website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
