import { Skeleton } from "@/components/ui/skeleton";

// Enquanto a lista de clientes carrega.
export default function ClientsLoading() {
  return (
    <>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-14 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-card" />
        ))}
      </div>
    </>
  );
}
