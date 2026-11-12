import { Skeleton } from "@/components/ui/skeleton";

// Enquanto a agenda do dia carrega.
export default function AgendaLoading() {
  return (
    <>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-card" />
        ))}
      </div>
    </>
  );
}
