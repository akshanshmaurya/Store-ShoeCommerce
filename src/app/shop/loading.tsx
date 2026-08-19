import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Header Skeleton */}
      <div className="space-y-4 border-b border-border pb-8">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 w-64 md:w-96 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-lg rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-hidden">
        <Skeleton className="h-9 w-28 rounded-full shrink-0" />
        <Skeleton className="h-9 w-36 rounded-full shrink-0" />
        <Skeleton className="h-9 w-32 rounded-full shrink-0" />
        <Skeleton className="h-9 w-32 rounded-full shrink-0" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4 space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-5 w-full rounded" />
            </div>
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
