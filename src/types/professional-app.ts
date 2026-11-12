import type { AppointmentStatus } from "@/types/appointment";

// Respostas das rotas do app do profissional (backend: /professional-app).
// Sem pagamento nem contato do cliente: a API não os envia.

export type ProfessionalAgendaAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  note: string | null;
  /** Encaixe: marcado fora do horário de funcionamento. */
  overBooking: boolean;
  client: { id: string; name: string };
  service: {
    id: string;
    name: string;
    color: string | null;
    /** Em minutos. */
    duration: number;
    price: number | null;
  };
  /** De uma recorrência (`isPackage`: de um pacote); nulo no avulso. */
  recurrence: { isPackage: boolean } | null;
  /** Aluno de uma sessão de turma: os da mesma sessão formam um cartão só. */
  classSession: {
    id: string;
    capacity: number;
    cancelledAt: string | null;
  } | null;
};

export type ProfessionalAgendaBlock = {
  id: string;
  startAt: string;
  endAt: string;
};

export type ProfessionalAgenda = {
  /** O dia da agenda (AAAA-MM-DD), no relógio da empresa. */
  day: string;
  appointments: ProfessionalAgendaAppointment[];
  blocks: ProfessionalAgendaBlock[];
};

/** Um cliente da carteira do profissional, como a lista o mostra. */
export type ProfessionalClient = {
  id: string;
  name: string;
  photoUrl: string | null;
  /** Celular do contato principal (só dígitos). */
  phone: string | null;
  lastCompleted: { startAt: string; serviceName: string } | null;
  nextAt: string | null;
};

export type ProfessionalClientsPage = {
  items: ProfessionalClient[];
  total: number;
  page: number;
  limit: number;
};

/** Um atendimento do histórico do cliente com o profissional. */
export type ProfessionalClientAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  note: string | null;
  overBooking: boolean;
  /** Aluno de uma sessão de turma. */
  inClass: boolean;
  service: ProfessionalAgendaAppointment["service"];
  recurrence: { isPackage: boolean } | null;
};

export type ProfessionalClientDetail = ProfessionalClient & {
  /** Os atendimentos mais recentes, do mais novo ao mais antigo. */
  history: ProfessionalClientAppointment[];
};
