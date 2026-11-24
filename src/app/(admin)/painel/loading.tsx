import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto o Painel carrega: os cartões do topo e os blocos.
export default function PlatformDashboardLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <h1 className="text-2xl font-semibold">Painel</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-card" />
        ))}
      </div>
    </div>
  );
}
