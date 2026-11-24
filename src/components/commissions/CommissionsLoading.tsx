import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto as Comissões carregam (screen-patterns.md).
export function CommissionsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Comissões</h1>
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-full sm:w-60" />
        <Skeleton className="h-10 w-44 max-sm:hidden" />
        <Skeleton className="h-10 w-44 max-sm:hidden" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-card" />
    </div>
  );
}
