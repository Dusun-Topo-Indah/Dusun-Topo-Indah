import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Beranda</h1>
        <p className="text-gray-500 mt-2">Ringkasan informasi Sistem Informasi Geografis Dusun Topo Indah.</p>
      </div>

      <div className="grid gap-6 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selamat Datang</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Admin Dashboard</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gunakan menu di sebelah kiri untuk mengelola konten website.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
