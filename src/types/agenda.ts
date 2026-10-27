import type { AppointmentStatus } from "@/types/appointment";

/** Intervalo do dia, em "HH:mm". */
export type TimeRange = {
  start: string;
  end: string;
};

/** Profissional como a agenda o exibe (uma coluna da grade). */
export type AgendaProfessional = {
  id: string;
  name: string;
};

/** Agendamento como a agenda o exibe, com os horários já no fuso da empresa. */
export type AgendaAppointment = {
  id: string;
  professionalId: string;
  clientId: string;
  serviceId: string;
  /** "HH:mm" */
  start: string;
  /** "HH:mm"; "24:00" quando o atendimento vai até o fim do dia. */
  end: string;
  clientName: string;
  clientPhotoUrl: string | null;
  professionalName: string;
  serviceName: string;
  serviceColor: string;
  /** Duração do serviço, em minutos. */
  durationMinutes: number;
  note: string | null;
  status: AppointmentStatus;
  /**
   * Encaixe: agendamento marcado fora do horário de funcionamento (campo
   * `overBooking` da API).
   */
  overbooking: boolean;
  /** Recorrência de origem (nulo no agendamento avulso). */
  recurrence: { id: string; clientPlanId: string | null } | null;
  /**
   * Atendimento já feito (ou em andamento) sem acompanhamento na anamnese. Só a
   * agenda do dia preenche, e só para quem tem acesso às fichas.
   */
  withoutEntry?: boolean;
};
