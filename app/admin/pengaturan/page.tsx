import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function PengaturanComingSoon() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-2">Konfigurasi website dusun.</p>
      </div>

      <Card className="shadow-sm max-w-xl">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <Hammer className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mt-2">
            Halaman pengaturan profil desa dan konfigurasi sedang dalam tahap pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
