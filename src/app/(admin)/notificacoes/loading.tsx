import { Skeleton } from "@/components/ui/skeleton";

// Enquanto as notificações carregam.
export default function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  );
}
