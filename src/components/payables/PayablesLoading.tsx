import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto o Contas a pagar carrega (screen-patterns.md).
export function PayablesLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Contas a pagar</h1>
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="hidden gap-3 sm:grid sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-10 w-full sm:w-96" />
      <Skeleton className="min-h-72 flex-1 rounded-card" />
    </div>
  );
}
