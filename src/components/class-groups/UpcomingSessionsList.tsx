"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listUpcomingSessionsAction } from "@/app/(admin)/class-session-actions";
import { shortDayLabel } from "@/components/recurrences/recurrence-schedule";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpcomingClassSession } from "@/types/class-group";

/**
 * Próximas sessões da turma (4 semanas) na Visualização: data, vagas e os
 * alunos de cada uma. Os horários ainda sem sessão aparecem "Sem alunos".
 */
export function UpcomingSessionsList({
  classGroupId,
}: {
  classGroupId: string;
}) {
  const [sessions, setSessions] = useState<UpcomingClassSession[] | null>(null);

  useEffect(() => {
    let current = true;
    listUpcomingSessionsAction(classGroupId).then((result) => {
      if (!current) return;
      if (result.ok) setSessions(result.sessions);
      else {
        setSessions([]);
        toast.error("Não foi possível carregar as sessões.", {
          description: result.message,
        });
      }
    });
    return () => {
      current = false;
    };
  }, [classGroupId]);

  if (sessions === null) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma sessão nas próximas 4 semanas.
      </p>
    );
  }

  return (
    // Rolagem própria: uma turma de vários dias tem muitas sessões no mês.
    <ul className="max-h-72 divide-y divide-border overflow-auto rounded-control border border-border text-sm">
      {sessions.map((session) => (
        <li key={`${session.date}|${session.time}`} className="px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="tabular-nums">
              {shortDayLabel(session.date)} às {session.time}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {session.cancelledAt
                ? "Cancelada"
                : `${session.occupied} de ${session.capacity} vagas`}
            </span>
          </div>
          <p className="truncate text-muted-foreground">
            {session.students.length > 0
              ? session.students.join(", ")
              : "Sem alunos"}
          </p>
        </li>
      ))}
    </ul>
  );
}
