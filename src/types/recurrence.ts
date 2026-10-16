// Espelha a resposta de /recurring-appointments do backend (com os dados
// relacionados que o frontend pediu: cliente, profissional e serviço).
import type { AppointmentStatus } from "@/types/appointment";
import type { WeekDay } from "@/types/business-hour";

/** Dia reservado pela recorrência; horários "HH:MM". */
export type RecurrenceDay = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
};

export type RecurrencePerson = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export type RecurrenceItem = {
  id: string;
  client: RecurrencePerson;
  professional: RecurrencePerson;
  service: { id: string; name: string; color: string | null; duration: number };
  /** Datas de calendário, "aaaa-mm-dd". */
  startDate: string;
  endDate: string;
  note: string | null;
  isActive: boolean;
  /** Preenchido quando a recorrência é a agenda de um serviço de um pacote. */
  clientPlanId: string | null;
  days: RecurrenceDay[];
};

/** Sessão (agendamento) gerada pela recorrência. */
export type RecurrenceSession = {
  id: string;
  /** Início e fim em UTC (ISO 8601). */
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
};

/** Dados para criar uma recorrência. */
export type NewRecurrenceInput = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  note?: string;
  days: RecurrenceDay[];
};
