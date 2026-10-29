import type { AgendaAppointment } from "@/types/agenda";

/** Sessão de turma como a grade a desenha: um bloco com os alunos dela. */
export type AgendaClassSession = {
  id: string;
  professionalId: string;
  /** Turma fixa de origem (nulo na sessão avulsa). */
  classGroupId: string | null;
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
