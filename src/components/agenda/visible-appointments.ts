import type { AgendaClassSession } from "@/components/agenda/class-session-blocks";
import type { AgendaAppointment, TimeRange } from "@/types/agenda";
import { timeToMinutes } from "@/utils/time";

function overlaps(a: TimeRange, b: TimeRange) {
  return (
    timeToMinutes(a.start) < timeToMinutes(b.end) &&
    timeToMinutes(a.end) > timeToMinutes(b.start)
  );
}

/**
 * Agendamentos avulsos de um profissional que aparecem na grade. Os ativos
 * sempre aparecem. Um cancelado só aparece (esmaecido) se não ficar sobreposto
 * a nada: nem a um agendamento ativo que ocupou o horário liberado, nem a uma
 * sessão de turma (mesmo vazia, pois o horário dela já é um bloco na grade),
 * nem a outro cancelado já exibido (o horário pode ser liberado e reaproveitado
 * várias vezes).
 */
export function visibleAppointments(
  singles: AgendaAppointment[],
  sessions: AgendaClassSession[],
  professionalId: string,
): AgendaAppointment[] {
  const mine = singles
    .filter((appointment) => appointment.professionalId === professionalId)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  const busy: TimeRange[] = sessions.filter(
    (session) => session.professionalId === professionalId,
  );
  const shown = mine.filter((appointment) => appointment.status !== "CANCELLED");
  for (const appointment of mine) {
    if (appointment.status !== "CANCELLED") continue;
    if (![...shown, ...busy].some((other) => overlaps(other, appointment))) {
      shown.push(appointment);
    }
  }
  return shown;
}
