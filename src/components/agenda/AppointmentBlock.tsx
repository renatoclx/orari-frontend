import { CircleCheck } from "lucide-react";
import type { AgendaAppointment, AppointmentStatus } from "@/types/agenda";

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

type AppointmentBlockProps = {
  appointment: AgendaAppointment;
  top: number;
  height: number;
};

export function AppointmentBlock({
  appointment,
  top,
  height,
}: AppointmentBlockProps) {
  const { status, serviceColor } = appointment;
  const statusLabel = statusLabels[status];
  const faded = status === "COMPLETED" || status === "CANCELLED";

  return (
    <article
      title={`${appointment.clientName}, ${appointment.serviceName} (${statusLabel})`}
      className={`absolute inset-x-1 overflow-hidden rounded-control border-l-[3px] px-2 py-1 ${
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
        <time className="text-xs text-muted tabular-nums">
          {appointment.start}
        </time>
        <h3
          className={`truncate text-sm font-medium ${
            status === "CANCELLED" ? "line-through" : ""
          }`}
        >
          {appointment.clientName}
        </h3>

        {status === "CONFIRMED" && (
          <CircleCheck
            className="ml-auto size-3.5 shrink-0 text-foreground"
            aria-hidden="true"
          />
        )}
        {status === "IN_PROGRESS" && (
          <span
            className="ml-auto size-2 shrink-0 rounded-full motion-safe:animate-pulse"
            style={{ backgroundColor: serviceColor }}
            aria-hidden="true"
          />
        )}
        <span className="sr-only">{statusLabel}</span>
      </div>
      <p className="truncate text-xs text-muted">{appointment.serviceName}</p>
    </article>
  );
}
