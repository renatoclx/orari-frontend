"use client";

import { useState, useTransition } from "react";
import { Ban, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import {
  cancelRecurrenceSessionAction,
  rescheduleRecurrenceSessionAction,
} from "@/app/(admin)/recurrence-actions";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import { RescheduleSessionDialog } from "@/components/recurrences/RescheduleSessionDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import type { RecurrenceSession } from "@/types/recurrence";
import { formatDateOnly } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

type RecurrenceSessionsProps = {
  recurrenceId: string;
  sessions: RecurrenceSession[];
  /** Recorrência (ou contratação) ativa: só assim as sessões mudam. */
  active: boolean;
  timeZone: string;
  /** Relógio da tela (useAgendaClock): o que já começou não muda. */
  today: string;
  nowTime: string;
  /** Para o remanejamento: quem atende, para quem, quanto dura e o período. */
  professional: { id: string; name: string };
  clientName: string;
  duration: number;
  period: { start: string; end: string };
  /** Chamado depois de cancelar ou remanejar (ex.: buscar as sessões de novo). */
  onChanged?: () => void;
};

/**
 * Sessões de uma recorrência (avulsa ou agenda de pacote), com remanejar e
 * cancelar sessão. Usada na tela da recorrência e no diálogo da contratação.
 */
export function RecurrenceSessions({
  recurrenceId,
  sessions,
  active,
  timeZone,
  today,
  nowTime,
  professional,
  clientName,
  duration,
  period,
  onChanged,
}: RecurrenceSessionsProps) {
  const [cancelling, setCancelling] = useState<RecurrenceSession | null>(null);
  const [rescheduling, setRescheduling] = useState<RecurrenceSession | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const dateOf = (session: RecurrenceSession) =>
    toDateString(new Date(session.startAt), timeZone);
  const timeOf = (iso: string) => toTimeString(iso, timeZone);
  const dateLabel = (session: RecurrenceSession) =>
    formatDateOnly(`${dateOf(session)}T00:00:00Z`);

  // Só se mexe em sessão que ainda não começou e não está encerrada.
  function editable(session: RecurrenceSession): boolean {
    if (!active) return false;
    if (session.status !== "SCHEDULED" && session.status !== "CONFIRMED") {
      return false;
    }
    const date = dateOf(session);
    return (
      date > today || (date === today && timeOf(session.startAt) > nowTime)
    );
  }

  function cancelSession() {
    if (!cancelling) return;
    const target = cancelling;
    startTransition(async () => {
      const result = await cancelRecurrenceSessionAction(
        recurrenceId,
        target.id,
      );
      if (result.ok) {
        toast.success("Sessão cancelada.", {
          description: `${dateLabel(target)}, ${timeOf(target.startAt)}`,
        });
        setCancelling(null);
        onChanged?.();
      } else {
        toast.error("Não foi possível cancelar a sessão.", {
          description: result.message,
        });
      }
    });
  }

  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {["Data", "Horário", "Status", "Ações"].map((title) => (
              <th key={title} scope="col" className={headerClass}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sessions.map((session) => {
            const { label, icon: StatusIcon } =
              APPOINTMENT_STATUS[session.status];
            return (
              <tr key={session.id} className="hover:bg-background">
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {dateLabel(session)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {timeOf(session.startAt)} às {timeOf(session.endAt)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <StatusIcon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {label}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {editable(session) && (
                    <div className="flex items-center gap-1">
                      <Hint label="Remanejar sessão">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remanejar a sessão de ${dateLabel(session)}`}
                          onClick={() => setRescheduling(session)}
                        >
                          <CalendarClock aria-hidden="true" />
                        </Button>
                      </Hint>
                      <Hint label="Cancelar sessão">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Cancelar a sessão de ${dateLabel(session)}`}
                          onClick={() => setCancelling(session)}
                        >
                          <Ban aria-hidden="true" />
                        </Button>
                      </Hint>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <RescheduleSessionDialog
        professional={professional}
        clientName={clientName}
        duration={duration}
        period={period}
        onSubmit={async (date, time) => {
          const result = await rescheduleRecurrenceSessionAction(
            recurrenceId,
            rescheduling?.id ?? "",
            date,
            time,
          );
          if (result.ok) onChanged?.();
          return result;
        }}
        session={
          rescheduling && {
            id: rescheduling.id,
            date: dateOf(rescheduling),
            time: timeOf(rescheduling.startAt),
          }
        }
        today={today}
        onOpenChange={(open) => !open && setRescheduling(null)}
      />

      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="Cancelar sessão?"
        description={
          cancelling
            ? `A sessão de ${dateLabel(cancelling)}, das ${timeOf(cancelling.startAt)} às ${timeOf(cancelling.endAt)}, será cancelada e o horário ficará livre. As demais sessões continuam.`
            : ""
        }
        confirmLabel="Cancelar sessão"
        icon={Ban}
        pendingLabel="Cancelando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        onConfirm={cancelSession}
      />
    </>
  );
}
