import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto exibido enquanto a ficha carrega (screen-patterns.md).
export function AnamnesisDetailLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((column) => (
          <div
            key={column}
            className="space-y-4 rounded-card border border-border bg-card p-6"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
