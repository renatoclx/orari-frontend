"use client";

import { useEffect, useRef } from "react";
import { CalendarX, UserRound, UsersRound } from "lucide-react";
import {
  currentEntryIndex,
  type AgendaListEntry,
} from "@/components/agenda/agenda-list";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import type { AgendaClassSession } from "@/components/agenda/class-session-blocks";
import { cn } from "@/lib/utils";
import type { AgendaAppointment } from "@/types/agenda";

// Concluído, cancelado e falta ficam esmaecidos, como na grade.
const FADED_STATUSES = ["COMPLETED", "CANCELLED", "NO_SHOW"];

type AgendaDayListProps = {
  entries: AgendaListEntry[];
  /** Minutos de agora quando o dia é hoje (a lista abre no que está em curso). */
  nowMinutes: number | null;
  /** Muda a cada dia exibido: a lista volta a se posicionar. */
  scrollKey: string;
  onAppointmentSelect: (appointment: AgendaAppointment) => void;
  onClassSessionSelect: (session: AgendaClassSession) => void;
  className?: string;
};

/**
 * "Lista do dia" do celular (screens/agendamentos.md): todos os profissionais
 * em ordem de horário, cada linha com a cor do serviço, o profissional e a
 * situação. Tocar abre os mesmos diálogos da grade. Só desenha: a montagem
 * fica em agenda-list.ts.
 */
export function AgendaDayList({
  entries,
  nowMinutes,
  scrollKey,
  onAppointmentSelect,
  onClassSessionSelect,
  className,
}: AgendaDayListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Hoje, abre no que está acontecendo ou vem a seguir; nos outros dias, no
  // começo. Só ao trocar de dia: a atualização automática não mexe na rolagem.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const index =
      nowMinutes === null ? -1 : currentEntryIndex(entries, nowMinutes);
    const row = list.querySelector<HTMLElement>(`[data-index="${index}"]`);
    list.scrollTop = row ? row.offsetTop : 0;
    // Só na troca de dia (ou de visão), não a cada renderização.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey]);

  return (
    <div
      ref={listRef}
      className={cn(
        "relative min-h-0 flex-1 overflow-auto rounded-card border border-border bg-card",
        className,
      )}
    >
      {entries.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
          <CalendarX
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            Nenhum agendamento neste dia.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {entries.map((entry, index) => (
            <li key={entry.key} data-index={index}>
              {entry.kind === "appointment" ? (
                <AppointmentRow
                  appointment={entry.appointment}
                  onSelect={onAppointmentSelect}
                />
              ) : (
                <SessionRow
                  session={entry.session}
                  onSelect={onClassSessionSelect}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Linha clicável com a faixa da cor do serviço e o horário à esquerda.
function Row({
  color,
  faded,
  start,
  end,
  label,
  onClick,
  children,
}: {
  color: string;
  faded: boolean;
  start: string;
  end: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted ${
        faded ? "text-muted-foreground" : ""
      }`}
    >
      <span
        className="w-1 shrink-0 self-stretch rounded-full"
        style={{
          backgroundColor: faded
            ? `color-mix(in srgb, ${color} 45%, transparent)`
            : color,
        }}
        aria-hidden="true"
      />
      <span className="w-12 shrink-0 tabular-nums">
        <span className="block font-semibold">{start}</span>
        <span className="block text-xs text-muted-foreground">{end}</span>
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">{children}</span>
    </button>
  );
}

function ProfessionalLine({ name }: { name: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
      <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{name}</span>
    </span>
  );
}

function AppointmentRow({
  appointment,
  onSelect,
}: {
  appointment: AgendaAppointment;
  onSelect: (appointment: AgendaAppointment) => void;
}) {
  const { status } = appointment;
  const { label: statusLabel, icon: StatusIcon } = APPOINTMENT_STATUS[status];
  const details = [
    appointment.serviceName,
    appointment.overbooking ? "Encaixe" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Row
      color={appointment.serviceColor}
      faded={FADED_STATUSES.includes(status)}
      start={appointment.start}
      end={appointment.end}
      label={`${appointment.start} às ${appointment.end}, ${appointment.clientName}, ${details}, com ${appointment.professionalName}. ${statusLabel}`}
      onClick={() => onSelect(appointment)}
    >
      <span
        className={`block truncate font-medium ${
          status === "CANCELLED" ? "line-through" : ""
        }`}
      >
        {appointment.clientName}
      </span>
      <span className="block truncate text-sm text-muted-foreground">
        {details}
      </span>
      <span className="flex items-center justify-between gap-2">
        <ProfessionalLine name={appointment.professionalName} />
        {/* A situação por escrito, como no bloco da grade. */}
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <StatusIcon className="size-3.5 shrink-0" aria-hidden="true" />
          {statusLabel}
        </span>
      </span>
    </Row>
  );
}

function SessionRow({
  session,
  onSelect,
}: {
  session: AgendaClassSession;
  onSelect: (session: AgendaClassSession) => void;
}) {
  const cancelled = session.cancelledAt !== null;
  const active = session.members.filter((m) => m.status !== "CANCELLED");
  const students = cancelled
    ? "Sessão cancelada"
    : active.length > 0
      ? active.map((m) => m.clientName.split(" ")[0]).join(", ")
      : "Sem alunos";

  return (
    <Row
      color={session.serviceColor}
      faded={cancelled || session.occupied === 0}
      start={session.start}
      end={session.end}
      label={`${session.start} às ${session.end}, turma de ${session.serviceName}, com ${session.professionalName}. ${cancelled ? "Sessão cancelada" : `${session.occupied} de ${session.capacity} vagas ocupadas`}`}
      onClick={() => onSelect(session)}
    >
      <span
        className={`block truncate font-medium ${cancelled ? "line-through" : ""}`}
      >
        {session.serviceName}
      </span>
      <span className="block truncate text-sm text-muted-foreground">
        Turma · {students}
      </span>
      <span className="flex items-center justify-between gap-2">
        <ProfessionalLine name={session.professionalName} />
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <UsersRound className="size-3.5 shrink-0" aria-hidden="true" />
          {session.occupied}/{session.capacity}
        </span>
      </span>
    </Row>
  );
}
