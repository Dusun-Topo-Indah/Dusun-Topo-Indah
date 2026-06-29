import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="w-full max-w-3xl space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      <div className="pt-4 flex md:col-span-2">
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
