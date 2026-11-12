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

/** Resumo do mês das comissões dele (valores em texto, duas casas). */
export type ProfessionalCommissionSummary = {
  /** AAAA-MM. */
  month: string;
  /** Falso para quem não recebe comissão (ex.: o dono que atende). */
  receivesCommission: boolean;
  count: number;
  base: string;
  amount: string;
  /** Adiantado e a receber: em aberto, sem depender do mês. */
  advanced: string;
  toPay: string;
};

export type ProfessionalCommission = {
  id: string;
  startAt: string;
  clientName: string;
  serviceName: string;
  /** Sessão de pacote: a base é a parte da contratação. */
  fromPackage: boolean;
  baseAmount: string;
  type: "PERCENT" | "FIXED";
  /** Percentual (30.00) ou valor fixo da regra no dia da geração. */
  rate: string;
  amount: string;
  /** Número do fechamento que a quitou; nulo = em aberto. */
  closingNumber: number | null;
};

export type ProfessionalCommissionsPage = {
  items: ProfessionalCommission[];
  total: number;
  page: number;
  limit: number;
};

export type ProfessionalClosing = {
  id: string;
  number: number;
  /** AAAA-MM-DD. */
  cutoffDate: string;
  paidAt: string;
  paymentMethod: { name: string };
  commissionTotal: string;
  advanceTotal: string;
  paidAmount: string;
  appointmentsCount: number;
  /** Preenchido nos fechamentos desfeitos. */
  cancelledAt: string | null;
};

export type ProfessionalClosingsPage = {
  items: ProfessionalClosing[];
  total: number;
  page: number;
  limit: number;
};

export type ProfessionalClosingReceipt = ProfessionalClosing & {
  company: { name: string; corporateReason: string; document: string };
  professional: { name: string; document: string | null };
  details: {
    commissions: {
      startAt: string;
      client: string;
      service: string;
      base: string;
      amount: string;
    }[];
    advances: { date: string; note: string | null; amount: string }[];
  };
};
