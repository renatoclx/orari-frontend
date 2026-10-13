// Espelha o enum AppointmentStatus do backend.
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type TimeRange = {
  start: string;
  end: string;
};

export type Professional = {
  id: string;
  name: string;
  workingHours: TimeRange;
  breaks: TimeRange[];
};

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
