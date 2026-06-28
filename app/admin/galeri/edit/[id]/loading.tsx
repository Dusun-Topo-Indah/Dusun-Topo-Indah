import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingGaleriEdit() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/galeri"
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Edit Foto Galeri</h1>
      </div>

      <div className="max-w-2xl space-y-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Skeleton Foto Kover */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-48 w-full" />
          </div>

          {/* Skeleton Kategori */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Skeleton Judul */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Skeleton Deskripsi */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Skeleton Button */}
        <div className="pt-4 flex md:col-span-2">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
