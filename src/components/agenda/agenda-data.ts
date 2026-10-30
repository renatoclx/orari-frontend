import {
  sortByName,
  type AgendaClassSession,
} from "@/components/agenda/class-session-blocks";
import type { AgendaAppointment } from "@/types/agenda";
import type { AppointmentItem } from "@/types/appointment";
import type { ClassSessionAgendaItem } from "@/types/class-group";
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
    recurrence: item.recurringAppointment,
    paid: item.payment?.status === "PAID" && item.payment.deletedAt === null,
    classSession: item.classSession,
    cancelReason: item.cancelReason,
  };
}

/**
 * Sessões da consulta por sessão (GET /class-sessions) → blocos da grade. Os
 * alunos são os agendamentos do dia ligados a cada sessão; o horário ainda sem
 * sessão (`id` nulo) vem vazio.
 */
export function toAgendaClassSessions(
  items: ClassSessionAgendaItem[],
  appointments: AgendaAppointment[],
  timeZone: string,
  dayEnd: Date,
): AgendaClassSession[] {
  return items.map((item) => {
    const endsAfterDay = new Date(item.endAt).getTime() >= dayEnd.getTime();
    return {
      id: item.id,
      professionalId: item.professional.id,
      classGroupId: item.classGroup?.id ?? null,
      classGroupName: item.classGroup?.name ?? null,
      start: toTimeString(item.startAt, timeZone),
      end: endsAfterDay ? "24:00" : toTimeString(item.endAt, timeZone),
      serviceName: item.service.name,
      // Como no agendamento: a sessão de encaixe tem a cor do encaixe.
      serviceColor: item.overBooking
        ? OVERBOOKING_COLOR
        : (item.service.color ?? DEFAULT_SERVICE_COLOR),
      durationMinutes: item.service.duration,
      professionalName: item.professional.name,
      capacity: item.capacity,
      occupied: item.occupied,
      members: sortByName(
        appointments.filter(
          (appointment) =>
            item.id !== null && appointment.classSession?.id === item.id,
        ),
      ),
      cancelledAt: item.cancelledAt,
      cancellationNote: item.cancellationNote,
    };
  });
}
