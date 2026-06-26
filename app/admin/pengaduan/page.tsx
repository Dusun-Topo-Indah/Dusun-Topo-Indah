
import { Hammer } from "lucide-react";

export default function PengaduanComingSoon() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pengaduan Masyarakat</h1>
        <p className="text-gray-500 mt-2">Kotak masuk pengaduan warga.</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 max-w-xl">
        <div className="flex flex-row items-center gap-3 pb-2">
          <Hammer className="h-6 w-6 text-primary/60" />
          <h3 className="text-xl font-bold text-primary">Coming Soon</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Halaman untuk membaca pesan dan aduan warga sedang dalam tahap pengembangan.
        </p>
      </div>
    </div>
  );
}
