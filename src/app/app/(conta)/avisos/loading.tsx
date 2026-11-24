import { Skeleton } from "@/components/ui/skeleton";

// Enquanto os avisos carregam.
export default function NoticesLoading() {
  return (
    <>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-64 w-full rounded-card" />
    </>
  );
}
