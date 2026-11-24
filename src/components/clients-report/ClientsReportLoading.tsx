import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto o Perfil do cliente carrega (screen-patterns.md).
export function ClientsReportLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Perfil do cliente</h1>
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap items-center gap-3 max-sm:hidden">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-48 rounded-card" />
        ))}
      </div>
    </div>
  );
}
