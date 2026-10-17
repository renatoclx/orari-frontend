import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { RecurrenceDetails } from "@/components/recurrences/RecurrenceDetails";
import { ApiError } from "@/services/api";
import { getCurrentUser } from "@/services/auth.service";
import {
  getRecurrence,
  listRecurrenceSessions,
} from "@/services/recurrence.service";

type RecurrenceDetailsPageProps = {
  id: string;
};

// Detalhes de uma recorrência: dados, sessões e ações.
export async function RecurrenceDetailsPage({
  id,
}: RecurrenceDetailsPageProps) {
  const renderedAt = new Date();
  const { company } = await getCurrentUser();

  let recurrence, sessions;
  try {
    [recurrence, sessions] = await Promise.all([
      getRecurrence(id),
      listRecurrenceSessions(id),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <Link
          href="/recorrencias"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Recorrências
        </Link>
        <h1 className="text-2xl font-semibold">Recorrência</h1>
      </div>

      <RecurrenceDetails
        recurrence={recurrence}
        sessions={sessions}
        timeZone={company.timezone}
        serverNow={renderedAt.getTime()}
      />
    </div>
  );
}
