import {
  classSessionKey,
  type AgendaClassSession,
} from "@/components/agenda/class-session-blocks";
import { visibleAppointments } from "@/components/agenda/visible-appointments";
import type { AgendaAppointment, AgendaProfessional } from "@/types/agenda";
import { timeToMinutes } from "@/utils/time";

/** Uma linha da "Lista do dia": um atendimento avulso ou uma sessão de turma. */
export type AgendaListEntry =
  | { kind: "appointment"; key: string; appointment: AgendaAppointment }
  | { kind: "session"; key: string; session: AgendaClassSession };

const startOf = (entry: AgendaListEntry) =>
  timeToMinutes(
    entry.kind === "appointment"
      ? entry.appointment.start
      : entry.session.start,
  );

const professionalOf = (entry: AgendaListEntry) =>
  entry.kind === "appointment"
    ? entry.appointment.professionalId
    : entry.session.professionalId;

/**
 * Lista do dia no celular (screens/agendamentos.md): o que a grade mostra, de
 * todos os profissionais, em ordem de horário. Os mesmos critérios da grade:
 * os alunos de uma turma viram uma linha por sessão, e um cancelado só aparece
 * se o horário não foi reaproveitado. No mesmo horário, a ordem é a dos
 * profissionais na agenda.
 */
export function agendaListEntries(
  professionals: AgendaProfessional[],
  appointments: AgendaAppointment[],
  sessions: AgendaClassSession[],
): AgendaListEntry[] {
  const singles = appointments.filter(
    (appointment) => appointment.classSession === null,
  );
  const order = new Map(professionals.map((item, index) => [item.id, index]));

  const entries: AgendaListEntry[] = [
    ...professionals.flatMap((professional) =>
      visibleAppointments(singles, sessions, professional.id).map(
        (appointment): AgendaListEntry => ({
          kind: "appointment",
          key: `a-${appointment.id}`,
          appointment,
        }),
      ),
    ),
    ...sessions
      .filter((session) => order.has(session.professionalId))
      .map((session): AgendaListEntry => ({
        kind: "session",
        key: `s-${classSessionKey(session)}`,
        session,
      })),
  ];

  return entries.sort(
    (a, b) =>
      startOf(a) - startOf(b) ||
      (order.get(professionalOf(a)) ?? 0) - (order.get(professionalOf(b)) ?? 0),
  );
}

/**
 * Índice da linha que a lista mostra ao abrir hoje: a primeira que ainda não
 * terminou (o que está acontecendo ou vem a seguir); -1 se todas já passaram.
 */
export function currentEntryIndex(
  entries: AgendaListEntry[],
  nowMinutes: number,
): number {
  return entries.findIndex((entry) => {
    const end =
      entry.kind === "appointment" ? entry.appointment.end : entry.session.end;
    return timeToMinutes(end) > nowMinutes;
  });
}
