import type { AppointmentStatus } from "@/types/appointment";
import type { ProfessionalAgenda } from "@/types/professional-app";

// Regras puras da agenda do app do profissional (screens/app-profissional.md):
// validar o dia da URL, andar entre dias e montar a lista do dia.

const DAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** O dia da URL (`?dia=`), ou nada se não for uma data que existe. */
export function parseDayParam(value: unknown): string | undefined {
  if (typeof value !== "string" || !DAY_FORMAT.test(value)) return undefined;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

/** O dia `delta` dias depois (ou antes, se negativo) de "AAAA-MM-DD". */
export function shiftDay(day: string, delta: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** Hoje no relógio da clínica, como "AAAA-MM-DD". */
export function todayIn(timeZone: string, now = new Date()): string {
  // O locale sv-SE já escreve a data como AAAA-MM-DD.
  return new Intl.DateTimeFormat("sv-SE", { timeZone }).format(now);
}

/** "Ontem", "Hoje" ou "Amanhã" para os dias vizinhos; nada para os demais. */
export function relativeDayLabel(day: string, today: string): string | null {
  if (day === today) return "Hoje";
  if (day === shiftDay(today, 1)) return "Amanhã";
  if (day === shiftDay(today, -1)) return "Ontem";
  return null;
}

/** "HH:mm" de um instante, no relógio da clínica. */
export function timeOf(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

/** Um aluno da sessão de turma, como o cartão o lista. */
export type AgendaClassMember = {
  id: string;
  name: string;
  status: AppointmentStatus;
};

/** Origem do atendimento, por escrito no cartão. */
export type AgendaOrigin = "overbooking" | "package" | "recurring";

export type AgendaEntry =
  | {
      kind: "appointment";
      key: string;
      start: string;
      end: string;
      clientName: string;
      serviceName: string;
      serviceColor: string | null;
      duration: number;
      price: number | null;
      status: AppointmentStatus;
      origin: AgendaOrigin | null;
      note: string | null;
    }
  | {
      kind: "class";
      key: string;
      start: string;
      end: string;
      serviceName: string;
      serviceColor: string | null;
      capacity: number;
      /** Alunos que ocupam vaga: não cancelados (a falta ocupa). */
      occupied: number;
      /** A clínica cancelou a sessão inteira. */
      cancelled: boolean;
      members: AgendaClassMember[];
    }
  | { kind: "block"; key: string; start: string; end: string };

/** Rótulo de cada origem, o mesmo na agenda e no histórico do cliente. */
export const ORIGIN_LABEL: Record<AgendaOrigin, string> = {
  overbooking: "Encaixe",
  package: "Pacote",
  recurring: "Recorrente",
};

/** Origem do atendimento: pacote, recorrência, encaixe ou avulso (nulo). */
export function originOf(appointment: {
  recurrence: { isPackage: boolean } | null;
  overBooking: boolean;
}): AgendaOrigin | null {
  if (appointment.recurrence)
    return appointment.recurrence.isPackage ? "package" : "recurring";
  return appointment.overBooking ? "overbooking" : null;
}

/**
 * A lista do dia em ordem de horário: atendimentos avulsos, uma entrada por
 * sessão de turma (os alunos de cada uma juntos) e os bloqueios. Os horários
 * vêm no relógio da clínica.
 */
export function buildEntries(
  agenda: ProfessionalAgenda,
  timeZone: string,
): AgendaEntry[] {
  const sorted: { at: number; entry: AgendaEntry }[] = [];
  const sessions = new Map<string, ProfessionalAgenda["appointments"]>();

  for (const appointment of agenda.appointments) {
    const sessionId = appointment.classSession?.id;
    if (sessionId) {
      sessions.set(sessionId, [
        ...(sessions.get(sessionId) ?? []),
        appointment,
      ]);
      continue;
    }
    sorted.push({
      at: Date.parse(appointment.startAt),
      entry: {
        kind: "appointment",
        key: appointment.id,
        start: timeOf(appointment.startAt, timeZone),
        end: timeOf(appointment.endAt, timeZone),
        clientName: appointment.client.name,
        serviceName: appointment.service.name,
        serviceColor: appointment.service.color,
        duration: appointment.service.duration,
        price: appointment.service.price,
        status: appointment.status,
        origin: originOf(appointment),
        note: appointment.note,
      },
    });
  }

  for (const [sessionId, group] of sessions) {
    const first = group[0];
    const session = first.classSession!;
    sorted.push({
      at: Date.parse(first.startAt),
      entry: {
        kind: "class",
        key: `class-${sessionId}`,
        start: timeOf(first.startAt, timeZone),
        end: timeOf(first.endAt, timeZone),
        serviceName: first.service.name,
        serviceColor: first.service.color,
        capacity: session.capacity,
        occupied: group.filter((item) => item.status !== "CANCELLED").length,
        cancelled: session.cancelledAt !== null,
        members: group
          .map((item) => ({
            id: item.id,
            name: item.client.name,
            status: item.status,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      },
    });
  }

  for (const block of agenda.blocks) {
    sorted.push({
      at: Date.parse(block.startAt),
      entry: {
        kind: "block",
        key: `block-${block.id}`,
        start: timeOf(block.startAt, timeZone),
        end: timeOf(block.endAt, timeZone),
      },
    });
  }

  return sorted.sort((a, b) => a.at - b.at).map(({ entry }) => entry);
}

/** "3 atendimentos" / "1 atendimento" / "Nenhum atendimento" (sem os cancelados). */
export function summarizeEntries(entries: AgendaEntry[]): string {
  const count = entries.filter((entry) => {
    if (entry.kind === "appointment") return entry.status !== "CANCELLED";
    if (entry.kind === "class") return !entry.cancelled;
    return false;
  }).length;
  if (count === 0) return "Nenhum atendimento";
  return count === 1 ? "1 atendimento" : `${count} atendimentos`;
}
