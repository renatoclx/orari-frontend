import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto exibido enquanto a listagem carrega (screen-patterns.md).
export function PaymentsListLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Pagamentos</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-60" />
      </div>
      <div className="min-h-0 flex-1 space-y-1 rounded-card border border-border bg-card p-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
