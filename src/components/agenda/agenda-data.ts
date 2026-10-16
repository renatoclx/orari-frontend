import type { AgendaAppointment } from "@/types/agenda";
import type { AppointmentItem } from "@/types/appointment";
import { toTimeString } from "@/utils/time";

// Serviço sem cor cadastrada: cinza neutro, para o bloco continuar legível.
const DEFAULT_SERVICE_COLOR = "#64748b";

/** Cor exclusiva do encaixe (agendamento fora do horário de funcionamento). */
export const OVERBOOKING_COLOR = "#6b7280";

/**
 * Agendamento da API → o que a grade desenha. Os horários vão para o fuso da
 * empresa; um atendimento que passa da meia-noite termina às 24:00 (a agenda
 * mostra um dia por vez).
 */
export function toAgendaAppointment(
  item: AppointmentItem,
  timeZone: string,
  dayEnd: Date,
): AgendaAppointment {
  const endsAfterDay = new Date(item.endAt).getTime() >= dayEnd.getTime();

  return {
    id: item.id,
    professionalId: item.professionalId,
    clientId: item.clientId,
    serviceId: item.serviceId,
    start: toTimeString(item.startAt, timeZone),
    end: endsAfterDay ? "24:00" : toTimeString(item.endAt, timeZone),
    clientName: item.client.name,
    clientPhotoUrl: item.client.photoUrl,
    professionalName: item.professional.name,
    serviceName: item.service.name,
    // O encaixe tem a sua cor exclusiva, no lugar da cor do serviço.
    serviceColor: item.overBooking
      ? OVERBOOKING_COLOR
      : (item.service.color ?? DEFAULT_SERVICE_COLOR),
    durationMinutes: item.service.duration,
    note: item.note,
    overbooking: item.overBooking,
    status: item.status,
  };
}
