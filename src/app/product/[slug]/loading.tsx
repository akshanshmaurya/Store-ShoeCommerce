import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-16">
      {/* Breadcrumbs Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery Skeleton */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 md:w-24">
            <Skeleton className="aspect-[3/4] w-16 md:w-full rounded-lg" />
            <Skeleton className="aspect-[3/4] w-16 md:w-full rounded-lg" />
            <Skeleton className="aspect-[3/4] w-16 md:w-full rounded-lg" />
          </div>
          <Skeleton className="flex-1 aspect-[3/4] rounded-xl" />
        </div>

        {/* Info Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-3/4 rounded" />
          <Skeleton className="h-16 w-full rounded" />
          <Skeleton className="h-12 w-48 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
