import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto enquanto os pagamentos do mês carregam.
export default function PaymentsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Cobranças</h1>
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-card" />
        ))}
      </div>
      <Skeleton className="min-h-40 flex-1 rounded-card" />
    </div>
  );
}
