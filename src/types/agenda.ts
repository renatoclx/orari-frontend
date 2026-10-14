// Espelha o enum AppointmentStatus do backend.
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

/** Intervalo do dia, em "HH:mm". */
export type TimeRange = {
  start: string;
  end: string;
};

/** Profissional com o expediente e as pausas que a agenda desenha. */
export type Professional = {
  id: string;
  name: string;
  workingHours: TimeRange;
  breaks: TimeRange[];
};

/** Agendamento como a agenda o exibe (provisório, até ligar à API). */
export type AgendaAppointment = {
  id: string;
  professionalId: string;
  start: string;
  end: string;
  clientName: string;
  serviceName: string;
  serviceColor: string;
  status: AppointmentStatus;
};
