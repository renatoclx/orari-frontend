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
  /** Encaixe: marcado fora do horário de funcionamento (retrato do momento). */
  overBooking: boolean;
  note: string | null;
  client: AppointmentPerson;
  professional: AppointmentPerson;
  service: AppointmentService;
  /** Recorrência de origem (nulo no agendamento avulso); `clientPlanId` se for de pacote. */
  recurringAppointment: { id: string; clientPlanId: string | null } | null;
  /**
   * Situação do pagamento do agendamento (nulo quando não há: a sessão de pacote
   * não tem o seu). Só para a tela saber se já foi pago.
   */
  payment: {
    status: "PENDING" | "PAID" | "CANCELLED";
    deletedAt: string | null;
  } | null;
  /** Sessão de turma a que o agendamento pertence (nulo fora de turma). */
  classSession: AppointmentClassSession | null;
};

/** A sessão de turma, como vem no agendamento. */
export type AppointmentClassSession = {
  id: string;
  /** Turma fixa de origem (nulo na sessão avulsa, de agendamento que virou turma). */
  classGroupId: string | null;
  capacity: number;
};
