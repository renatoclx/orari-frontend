import { recurrenceLabel } from "@/components/agenda/recurrence-label";
import {
  CalendarClock,
  Clock,
  Repeat,
  StickyNote,
  UserRound,
} from "lucide-react";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { AgendaAppointment } from "@/types/agenda";
import { formatDuration } from "@/utils/format";

// Concluído, cancelado e não compareceu ficam esmaecidos: já não pedem ação.
const FADED_STATUSES = ["COMPLETED", "CANCELLED", "NO_SHOW"];

type AppointmentBlockProps = {
  appointment: AgendaAppointment;
  top: number;
  height: number;
  /** Clique (ou Enter) no bloco: abre os detalhes do agendamento. */
  onSelect?: (appointment: AgendaAppointment) => void;
};

/**
 * Bloco de um agendamento na grade, posicionado por `top` e `height` (em px).
 * Ao passar o mouse (ou focar com o teclado), um cartão mostra os detalhes.
 */
export function AppointmentBlock({
  appointment,
  top,
  height,
  onSelect,
}: AppointmentBlockProps) {
  const { status, serviceColor } = appointment;
  const { label: statusLabel, icon: StatusIcon } = APPOINTMENT_STATUS[status];
  const faded = FADED_STATUSES.includes(status);

  return (
    <HoverCard openDelay={250} closeDelay={80}>
      <HoverCardTrigger asChild>
        <article
          // Focável para o cartão também abrir pelo teclado.
          tabIndex={0}
          onClick={() => onSelect?.(appointment)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSelect?.(appointment);
          }}
          aria-label={`${appointment.clientName}, ${appointment.serviceName}, das ${appointment.start} às ${appointment.end}, com ${appointment.professionalName}. ${statusLabel}${appointment.overbooking ? ". Encaixe fora do horário de funcionamento" : ""}${appointment.recurrence ? `. ${recurrenceLabel(appointment.recurrence)}` : ""}`}
          className={`absolute inset-x-1 z-[1] cursor-pointer overflow-hidden rounded-control border-l-[3px] px-2 py-1 ${
            faded ? "opacity-55" : ""
          }`}
          style={{
            top,
            height,
            borderLeftColor: serviceColor,
            // A cor do serviço vem do cadastro; aqui só suavizamos o fundo.
            backgroundColor: `color-mix(in srgb, ${serviceColor} 16%, transparent)`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <time className="text-xs text-muted-foreground tabular-nums">
              {appointment.start}
            </time>
            <h3
              className={`truncate text-sm font-medium ${
                status === "CANCELLED" ? "line-through" : ""
              }`}
            >
              {appointment.clientName}
            </h3>

            <StatusIcon
              className={`ml-auto size-3.5 shrink-0 ${
                status === "IN_PROGRESS" ? "motion-safe:animate-pulse" : ""
              }`}
              style={
                status === "IN_PROGRESS" ? { color: serviceColor } : undefined
              }
              aria-hidden="true"
            />
          </div>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            {appointment.overbooking && (
              <CalendarClock className="size-3 shrink-0" aria-hidden="true" />
            )}
            {appointment.recurrence && (
              <Repeat className="size-3 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{appointment.serviceName}</span>
          </p>
        </article>
      </HoverCardTrigger>

      <HoverCardContent side="right" align="start" collisionPadding={16}>
        <div className="flex items-start gap-3">
          <PersonAvatar
            name={appointment.clientName}
            photoUrl={appointment.clientPhotoUrl}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{appointment.clientName}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: serviceColor }}
                aria-hidden="true"
              />
              <span className="truncate">
                {appointment.serviceName} ·{" "}
                {formatDuration(appointment.durationMinutes)}
              </span>
            </p>
          </div>
        </div>

        <ul className="mt-3 space-y-2 border-t border-border pt-3 text-muted-foreground">
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">
              {appointment.start} às {appointment.end}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <UserRound className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">com {appointment.professionalName}</span>
          </li>
          <li className="flex items-center gap-2">
            <StatusIcon className="size-4 shrink-0" aria-hidden="true" />
            {statusLabel}
          </li>
          {appointment.overbooking && (
            <li className="flex items-center gap-2 font-medium text-foreground">
              <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
              Encaixe fora do horário de funcionamento
            </li>
          )}
          {appointment.recurrence && (
            <li className="flex items-center gap-2">
              <Repeat className="size-4 shrink-0" aria-hidden="true" />
              {recurrenceLabel(appointment.recurrence)}
            </li>
          )}
          {appointment.note && (
            <li className="flex items-start gap-2">
              <StickyNote
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="line-clamp-3">{appointment.note}</span>
            </li>
          )}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
