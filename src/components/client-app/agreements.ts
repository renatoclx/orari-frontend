import type { AppPlan, AppRecurrence } from "@/types/client-app";

// Textos de Pacotes e Recorrências no app (screens/app-cliente.md).

const STATUS: Record<AppPlan["status"], string> = {
  active: "Ativo",
  finished: "Encerrado",
  cancelled: "Cancelado",
};

export const planStatusLabel = (status: AppPlan["status"]) => STATUS[status];

/** "2026-11-12" → "12/11/2026" (data pura, sem fuso). */
export function formatDay(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

/** "De 12/11/2026 a 11/05/2027" ou "Desde 12/11/2026" (sem fim). */
export function periodLabel(start: string, end: string | null): string {
  return end
    ? `De ${formatDay(start)} a ${formatDay(end)}`
    : `Desde ${formatDay(start)}`;
}

// Na ordem da semana, começando na segunda.
const WEEK: { day: string; short: string }[] = [
  { day: "MONDAY", short: "Seg" },
  { day: "TUESDAY", short: "Ter" },
  { day: "WEDNESDAY", short: "Qua" },
  { day: "THURSDAY", short: "Qui" },
  { day: "FRIDAY", short: "Sex" },
  { day: "SATURDAY", short: "Sáb" },
  { day: "SUNDAY", short: "Dom" },
];

const joinPt = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;

/**
 * Dias e horários de uma recorrência, juntando os dias com o mesmo horário:
 * "Ter e Qui às 09:00"; horários diferentes viram linhas separadas.
 */
export function daysLabel(days: AppRecurrence["days"]): string[] {
  const byTime = new Map<string, string[]>();
  for (const { day, short } of WEEK) {
    for (const item of days.filter((entry) => entry.weekDay === day)) {
      byTime.set(item.startTime, [
        ...(byTime.get(item.startTime) ?? []),
        short,
      ]);
    }
  }
  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, shorts]) => `${joinPt(shorts)} às ${time}`);
}

/** Selo do tipo: horário fixo, de pacote ou de turma. */
export function recurrenceKindLabel(kind: AppRecurrence["kind"]): string {
  return kind === "CLASS"
    ? "Turma"
    : kind === "PLAN"
      ? "Pacote"
      : "Horário fixo";
}
