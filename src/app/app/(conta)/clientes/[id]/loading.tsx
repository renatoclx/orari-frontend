import { Skeleton } from "@/components/ui/skeleton";

// Enquanto a ficha do cliente carrega.
export default function ClientLoading() {
  return (
    <>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-20 w-full rounded-card" />
      <Skeleton className="h-24 w-full rounded-card" />
    </>
  );
}
