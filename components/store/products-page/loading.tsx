import { Skeleton } from "@/components/ui/skeleton";

export function ProductsLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
      <div className="w-full lg:w-60 lg:shrink-0">
        <div className="space-y-6">
          <div className="md:hidden">
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-24 mt-4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-6 w-24 mt-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Skeleton className="h-10 w-60" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-80" />
        </div>
      </div>
    </div>
  );
}
