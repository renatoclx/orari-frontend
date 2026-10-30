// Espelha a resposta de /class-groups do backend (turma fixa, docs/turmas.md).
import type {
  AppointmentCancelReason,
  AppointmentStatus,
} from "@/types/appointment";
import type { WeekDay } from "@/types/business-hour";

/** Dia e horário da turma; "HH:MM". O fim é o início mais a duração do serviço. */
export type ClassGroupDay = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
};

export type ClassGroupItem = {
  id: string;
  /** Opcional: serve só para identificar a turma. */
  name: string | null;
  serviceId: string;
  professionalId: string;
  /** Quantidade máxima de alunos por sessão. */
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  service: { id: string; name: string; color: string | null; duration: number };
  professional: { id: string; name: string; photoUrl: string | null };
  days: ClassGroupDay[];
};

/** Aluno da sessão: o agendamento dele (um por aluno), com a situação. */
export type ClassSessionParticipant = {
  /** Id do agendamento do aluno. */
  id: string;
  status: AppointmentStatus;
  /** Aula cancelada pela clínica na turma (sessão cancelada ou saída). */
  cancelReason: AppointmentCancelReason | null;
  client: { id: string; name: string; photoUrl: string | null };
};

/** Resposta de /class-sessions/:id: uma ocorrência da turma, com vagas e alunos. */
export type ClassSessionItem = {
  id: string;
  /** Nulo na sessão avulsa (agendamento que virou turma). */
  classGroupId: string | null;
  classGroup: { id: string; name: string | null } | null;
  service: { id: string; name: string; color: string | null; duration: number };
  professional: { id: string; name: string; photoUrl: string | null };
  /** Início e fim em UTC (ISO 8601). */
  startAt: string;
  endAt: string;
  capacity: number;
  cancelledAt: string | null;
  /** Motivo do cancelamento da sessão (ex.: "Feriado"). */
  cancellationNote: string | null;
  /** Alunos em ordem alfabética, inclusive os cancelados. */
  appointments: ClassSessionParticipant[];
  /** Alunos que ocupam vaga (não cancelados; a falta ocupa) e vagas livres. */
  occupied: number;
  /** A sessão cancelada não tem vaga livre. */
  available: number;
};

/**
 * Item de GET /class-sessions (agenda por sessão): as sessões do período e os
 * horários futuros das turmas fixas ainda sem sessão (`id` nulo, sem alunos).
 */
export type ClassSessionAgendaItem = Omit<
  ClassSessionItem,
  "id" | "classGroupId"
> & {
  id: string | null;
  overBooking: boolean;
};

/** Corpo de POST /class-groups (só o início de cada horário). */
export type ClassGroupInput = {
  name?: string;
  serviceId: string;
  professionalId: string;
  capacity: number;
  days: { weekDay: WeekDay; startTime: string }[];
};

/** Corpo de PATCH /class-groups/:id: só nome, vagas e situação mudam. `null` remove o nome. */
export type ClassGroupUpdate = {
  name?: string | null;
  capacity?: number;
  isActive?: boolean;
};

/**
 * Próxima sessão de uma turma fixa, no fuso da empresa (montada pela action a
 * partir de GET /class-sessions). `id` nulo: o horário ainda não tem sessão.
 */
export type UpcomingClassSession = {
  id: string | null;
  /** "aaaa-mm-dd" e "HH:mm". */
  date: string;
  time: string;
  capacity: number;
  occupied: number;
  available: number;
  cancelledAt: string | null;
  /** Nome dos alunos que ocupam vaga, em ordem alfabética. */
  students: string[];
};

/**
 * Aluno fixo da turma (GET /class-groups/:id/members): uma recorrência ativa,
 * avulsa ou de plano, encaixada na turma e sem saída. Um cliente pode aparecer
 * duas vezes (ex.: recorrência e plano em dias diferentes).
 */
export type ClassGroupMember = {
  recurringAppointmentId: string;
  client: { id: string; name: string; photoUrl: string | null };
  origin: "RECURRENCE" | "PLAN";
  /** A contratação, quando a vaga fixa é de um plano. */
  clientPlan: { id: string; planName: string } | null;
  /** Os horários da turma em que o aluno está. */
  days: { weekDay: WeekDay; startTime: string }[];
};
