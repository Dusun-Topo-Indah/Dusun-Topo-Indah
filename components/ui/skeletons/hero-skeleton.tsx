import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="w-full">
      {/* Hero Banner Skeleton */}
      <Skeleton className="w-full h-[600px] md:h-[700px] rounded-none" />
      
      {/* Search/Quick Info bar skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-12">
        <Skeleton className="w-full h-32 rounded-xl shadow-lg" />
      </div>

      {/* Intro section skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>
    </div>
  );
}
