import { Skeleton } from "@/components/ui/skeleton";

// Enquanto as preferências carregam.
export default function NoticePreferencesLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-14 w-72" />
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
