"use client";

import { useState, useTransition } from "react";
import { Ban, CalendarClock, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  cancelRecurrenceSessionAction,
  rescheduleRecurrenceSessionAction,
} from "@/app/(admin)/recurrence-actions";
import {
  APPOINTMENT_STATUS,
  CANCEL_REASON_LABEL,
} from "@/components/agenda/appointment-status";
import { useServiceClassGroups } from "@/components/class-groups/useServiceClassGroups";
import { LeaveClassButton } from "@/components/recurrences/LeaveClassButton";
import { ReplaceInClassDialog } from "@/components/recurrences/ReplaceInClassDialog";
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
  /** Sessões de pacote: a que o cliente perdeu (falta) pode ser reposta em outra data. */
  isPackage?: boolean;
  timeZone: string;
  /** Relógio da tela (useAgendaClock): o que já começou não muda. */
  today: string;
  nowTime: string;
  /** Para o remanejamento: quem atende, para quem, quanto dura e o período. */
  professional: { id: string; name: string };
  clientName: string;
  duration: number;
  period: { start: string; end: string };
  /** Serviço da recorrência: as turmas dele recebem a reposição em turma. */
  serviceId: string;
  /** Turma da recorrência (nula fora de turma), a saída dela e o motivo. */
  classGroupId: string | null;
  classLeftAt: string | null;
  classLeaveNote: string | null;
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
  isPackage = false,
  timeZone,
  today,
  nowTime,
  professional,
  clientName,
  duration,
  period,
  serviceId,
  classGroupId,
  classLeftAt,
  classLeaveNote,
  onChanged,
}: RecurrenceSessionsProps) {
  // Turmas do serviço (só o ADMIN as vê): reposição em turma e saída da turma.
  const { canManage, classGroups } = useServiceClassGroups(serviceId);
  const [replacingInClass, setReplacingInClass] =
    useState<RecurrenceSession | null>(null);
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

  // Reposição: sessão de pacote em que o cliente faltou, ou que a clínica
  // cancelou na turma (sessão cancelada ou saída), volta a ser agendada em
  // outra data (o backend aceita só em pacote).
  function replaceable(session: RecurrenceSession): boolean {
    return (
      isPackage &&
      active &&
      (session.status === "NO_SHOW" ||
        (session.status === "CANCELLED" && session.cancelReason !== null))
    );
  }

  // Situação por escrito: o motivo da clínica no lugar do "Cancelado" e a
  // marca de turma na aula que está numa sessão.
  function statusText(session: RecurrenceSession): string {
    const label = session.cancelReason
      ? CANCEL_REASON_LABEL[session.cancelReason]
      : APPOINTMENT_STATUS[session.status].label;
    return session.classSessionId && session.status !== "CANCELLED"
      ? `${label} · Turma`
      : label;
  }

  // Levar a aula para uma sessão de turma: com turma do serviço e aula que
  // ainda pode mudar (futura ou reposição).
  const classAction = (session: RecurrenceSession) =>
    canManage &&
    classGroups.length > 0 && (
      <Hint label="Repor em turma">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Repor em turma a sessão de ${dateLabel(session)}`}
          onClick={() => setReplacingInClass(session)}
        >
          <UsersRound aria-hidden="true" />
        </Button>
      </Hint>
    );

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

  // Remanejar e cancelar a sessão: os mesmos botões na tabela e no cartão.
  const sessionActions = (session: RecurrenceSession) => (
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
  );

  // Quem faltou só tem a reposição (não há o que cancelar ou remanejar).
  const replaceAction = (session: RecurrenceSession) => (
    <Hint label="Repor sessão">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Repor a sessão de ${dateLabel(session)}`}
        onClick={() => setRescheduling(session)}
      >
        <CalendarClock aria-hidden="true" />
      </Button>
    </Hint>
  );
  const rowActions = (session: RecurrenceSession) =>
    editable(session) ? (
      <div className="flex items-center gap-1">
        {sessionActions(session)}
        {classAction(session)}
      </div>
    ) : (
      replaceable(session) && (
        <div className="flex items-center gap-1">
          {replaceAction(session)}
          {classAction(session)}
        </div>
      )
    );

  return (
    <>
      {/* Recorrência em turma: a situação na turma e, para o ADMIN, a saída. */}
      {classGroupId && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <UsersRound className="size-4 shrink-0" aria-hidden="true" />
            {classLeftAt
              ? // A saída é um instante: o dia é o do fuso da empresa.
                `Saiu da turma em ${formatDateOnly(`${toDateString(new Date(classLeftAt), timeZone)}T00:00:00Z`)}${classLeaveNote ? `: ${classLeaveNote}` : ""}`
              : "Em turma"}
          </p>
          {canManage && active && !classLeftAt && (
            <LeaveClassButton
              recurrenceId={recurrenceId}
              clientName={clientName}
              isPackage={isPackage}
              onLeft={onChanged}
            />
          )}
        </div>
      )}

      {/* Celular: um cartão por sessão, sem rolagem lateral. A partir do md, tabela. */}
      <ul className="divide-y divide-border md:hidden">
        {sessions.map((session) => {
          const { icon: StatusIcon } = APPOINTMENT_STATUS[session.status];
          const label = statusText(session);
          return (
            <li
              key={session.id}
              className="flex items-center justify-between gap-2 p-4"
            >
              <div className="space-y-0.5 text-sm">
                <p className="font-medium tabular-nums">
                  {dateLabel(session)}, {timeOf(session.startAt)} às{" "}
                  {timeOf(session.endAt)}
                </p>
                <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <StatusIcon className="size-4" aria-hidden="true" />
                  {label}
                </p>
              </div>
              {rowActions(session)}
            </li>
          );
        })}
      </ul>

      <table className="hidden w-full text-left text-sm md:table">
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
            const { icon: StatusIcon } = APPOINTMENT_STATUS[session.status];
            const label = statusText(session);
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
                <td className="px-4 py-2">{rowActions(session)}</td>
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
        replacement={rescheduling !== null && replaceable(rescheduling)}
        inClass={Boolean(rescheduling?.classSessionId)}
        onOpenChange={(open) => !open && setRescheduling(null)}
      />

      <ReplaceInClassDialog
        recurrenceId={recurrenceId}
        session={
          replacingInClass && {
            id: replacingInClass.id,
            label: `${dateLabel(replacingInClass)}, ${timeOf(replacingInClass.startAt)}`,
          }
        }
        classGroups={classGroups}
        defaultClassGroupId={classGroupId}
        period={period}
        clientName={clientName}
        onDone={() => onChanged?.()}
        onOpenChange={(open) => !open && setReplacingInClass(null)}
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
