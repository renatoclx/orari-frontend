import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto exibido enquanto a agenda do dia carrega (screen-patterns.md).
export function AgendaLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Agendamentos</h1>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="ml-auto h-10 w-44" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-card">
        {Array.from({ length: 3 }, (_, column) => (
          <div key={column} className="space-y-4 p-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
