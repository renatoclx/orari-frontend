import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto exibido enquanto a listagem carrega (screen-patterns.md).
export function TemplatesListLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Modelos de ficha</h1>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-72" />
      </div>
      <div className="min-h-0 flex-1 space-y-1 rounded-card border border-border bg-card p-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
