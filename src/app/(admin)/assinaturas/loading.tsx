import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto a lista de assinaturas carrega (screen-patterns.md).
export default function SubscriptionsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Assinaturas</h1>
      <Skeleton className="h-10 w-56" />
      <div className="min-h-0 flex-1 space-y-1 rounded-card border border-border bg-card p-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
