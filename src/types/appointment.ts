// Espelha a resposta de /appointments do backend.

/** Mesmos valores do enum AppointmentStatus do backend. */
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

/** Pessoa ligada ao agendamento (cliente ou profissional), só o que a agenda usa. */
export type AppointmentPerson = {
  id: string;
  name: string;
  photoUrl: string | null;
};

/** Serviço ligado ao agendamento, só o que a agenda usa. */
export type AppointmentService = {
  id: string;
  name: string;
  color: string | null;
  /** Em minutos. */
  duration: number;
};

export type AppointmentItem = {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  /** Início e fim em UTC (ISO 8601). */
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  note: string | null;
  client: AppointmentPerson;
  professional: AppointmentPerson;
  service: AppointmentService;
};
