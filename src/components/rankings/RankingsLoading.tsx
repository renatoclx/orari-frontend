import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto os rankings carregam (screen-patterns.md).
export function RankingsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Rankings</h1>
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-44 max-sm:hidden" />
        <Skeleton className="h-10 w-44 max-sm:hidden" />
        <Skeleton className="h-10 w-full sm:w-60" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-card" />
    </div>
  );
}
