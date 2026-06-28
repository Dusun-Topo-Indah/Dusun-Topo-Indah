import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoadingBeritaEdit() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/berita"
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Edit Berita</h1>
      </div>

      <div className="max-w-3xl space-y-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Skeleton Judul */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Skeleton Kategori */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>

          {/* Skeleton Ringkasan */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Skeleton Foto */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-40 w-full" />
          </div>

          {/* Skeleton Naskah */}
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        {/* Skeleton Button */}
        <div className="pt-4 flex md:col-span-2">
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
