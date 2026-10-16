import type { AgendaAppointment } from "@/types/agenda";

/** Origem do agendamento que veio de uma recorrência (avulso não tem origem). */
export function recurrenceLabel(
  recurrence: NonNullable<AgendaAppointment["recurrence"]>,
): string {
  return recurrence.clientPlanId ? "Sessão de pacote" : "Recorrente";
}
