import { Skeleton } from "@/components/ui/skeleton";

// Enquanto as comissões do mês carregam.
export default function CommissionsLoading() {
  return (
    <>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-28 w-full rounded-card" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-20 rounded-card" />
        <Skeleton className="h-20 rounded-card" />
      </div>
      <Skeleton className="h-24 w-full rounded-card" />
    </>
  );
}
