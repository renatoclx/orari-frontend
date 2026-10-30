import type { AgendaAppointment } from "@/types/agenda";
import { timeToMinutes } from "@/utils/time";

/** Sessão de turma como a grade a desenha: um bloco com os alunos dela. */
export type AgendaClassSession = {
  /**
   * Nulo no horário de turma fixa que ainda não tem sessão: a API só cria a
   * sessão no primeiro encaixe, mas a agenda já mostra o horário, vazio.
   */
  id: string | null;
  professionalId: string;
  /** Turma fixa de origem (nulo na sessão avulsa). */
  classGroupId: string | null;
  /** Nome da turma, conhecido só no horário ainda sem sessão (vem do cadastro). */
  classGroupName?: string | null;
  start: string;
  end: string;
  serviceName: string;
  serviceColor: string;
  durationMinutes: number;
  professionalName: string;
  capacity: number;
  /** Alunos que ocupam vaga: não cancelados (a falta ocupa). */
  occupied: number;
  /** Agendamentos dos alunos, em ordem alfabética, inclusive os cancelados. */
  members: AgendaAppointment[];
};

/**
 * Separa os agendamentos avulsos dos de turma e junta os de cada sessão num
 * bloco só ("Pilates · 3/5"). Cada aluno tem o próprio agendamento; a agenda
 * mostra um por sessão, como pede a regra de turmas.
 */
export function splitClassSessions(appointments: AgendaAppointment[]): {
  singles: AgendaAppointment[];
  sessions: AgendaClassSession[];
} {
  const singles: AgendaAppointment[] = [];
  const byId = new Map<string, AgendaAppointment[]>();

  for (const appointment of appointments) {
    const sessionId = appointment.classSession?.id;
    if (!sessionId) {
      singles.push(appointment);
      continue;
    }
    byId.set(sessionId, [...(byId.get(sessionId) ?? []), appointment]);
  }

  const sessions = [...byId.values()].map((members) => {
    const [first] = members;
    const session = first.classSession!;
    return {
      id: session.id,
      professionalId: first.professionalId,
      classGroupId: session.classGroupId,
      start: first.start,
      end: first.end,
      serviceName: first.serviceName,
      serviceColor: first.serviceColor,
      durationMinutes: first.durationMinutes,
      professionalName: first.professionalName,
      capacity: session.capacity,
      occupied: members.filter((m) => m.status !== "CANCELLED").length,
      members: [...members].sort((a, b) =>
        a.clientName.localeCompare(b.clientName, "pt-BR"),
      ),
    };
  });

  return { singles, sessions };
}

/** Chave do bloco: o id da sessão ou, sem sessão, a turma e o horário. */
export function classSessionKey(session: AgendaClassSession): string {
  return session.id ?? `${session.classGroupId}-${session.start}`;
}

/**
 * Junta às sessões do dia os horários de turma fixa ainda sem sessão. Um
 * horário fica de fora se a turma já tem sessão nele, ou se o profissional
 * está ocupado ali (agendamento ativo ou outra sessão com alunos): o bloco
 * vazio não cobre um atendimento de verdade.
 */
export function withEmptyClassSessions(
  sessions: AgendaClassSession[],
  empty: AgendaClassSession[],
  singles: AgendaAppointment[],
): AgendaClassSession[] {
  const overlaps = (
    a: { start: string; end: string },
    b: { start: string; end: string },
  ) =>
    timeToMinutes(a.start) < timeToMinutes(b.end) &&
    timeToMinutes(a.end) > timeToMinutes(b.start);

  const busy = [
    ...singles.filter((appointment) => appointment.status !== "CANCELLED"),
    ...sessions.filter((session) => session.occupied > 0),
  ];
  const free = empty.filter(
    (slot) =>
      !sessions.some(
        (session) =>
          session.classGroupId === slot.classGroupId &&
          session.start === slot.start,
      ) &&
      !busy.some(
        (other) =>
          other.professionalId === slot.professionalId && overlaps(other, slot),
      ),
  );
  return [...sessions, ...free];
}
