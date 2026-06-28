import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPengaturan() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="max-w-3xl space-y-10 pb-20 mt-8">
        <div className="grid grid-cols-1 gap-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>

        <div className="pt-4 flex">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
