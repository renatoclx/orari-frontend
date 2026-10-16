import type { WeekDay } from "@/types/business-hour";
import type { RecurrenceDay } from "@/types/recurrence";
import { shiftDateString, timeToMinutes, weekDayOf } from "@/utils/time";

/** Dias da semana na ordem da tela (segunda a domingo). */
export const WEEK_DAYS: { id: WeekDay; short: string; long: string }[] = [
  { id: "MONDAY", short: "Seg", long: "Segunda-feira" },
  { id: "TUESDAY", short: "Ter", long: "Terça-feira" },
  { id: "WEDNESDAY", short: "Qua", long: "Quarta-feira" },
  { id: "THURSDAY", short: "Qui", long: "Quinta-feira" },
  { id: "FRIDAY", short: "Sex", long: "Sexta-feira" },
  { id: "SATURDAY", short: "Sáb", long: "Sábado" },
  { id: "SUNDAY", short: "Dom", long: "Domingo" },
];

const SHORT = Object.fromEntries(WEEK_DAYS.map((d) => [d.id, d.short]));

/** "Seg 09:00–10:00, Qua 14:00–15:00" */
export function describeDays(days: RecurrenceDay[]): string {
  const order = WEEK_DAYS.map((d) => d.id);
  return [...days]
    .sort((a, b) => order.indexOf(a.weekDay) - order.indexOf(b.weekDay))
    .map((d) => `${SHORT[d.weekDay]} ${d.startTime}–${d.endTime}`)
    .join(", ");
}

/**
 * Datas ("aaaa-mm-dd") das sessões da recorrência entre `startDate` e `endDate`,
 * com o horário de cada uma. Não inclui o que já passou (`today` e `nowMinutes`
 * no fuso da empresa): a API não gera ocorrências no passado.
 */
export function occurrences(
  startDate: string,
  endDate: string,
  days: RecurrenceDay[],
  today: string,
  nowMinutes: number,
): { date: string; day: RecurrenceDay }[] {
  const result: { date: string; day: RecurrenceDay }[] = [];
  if (!startDate || !endDate || endDate < startDate) return result;

  // Trava de segurança: a tela limita o período, mas nunca percorre mais de 5 anos.
  for (let date = startDate, i = 0; date <= endDate && i < 1830; i++) {
    const weekDay = weekDayOf(date);
    for (const day of days) {
      if (day.weekDay !== weekDay) continue;
      const past =
        date < today ||
        (date === today && timeToMinutes(day.startTime) <= nowMinutes);
      if (!past) result.push({ date, day });
    }
    date = shiftDateString(date, 1);
  }
  return result;
}

/** Duração máxima do período de uma recorrência, em meses (limite prévio do frontend). */
export const MAX_RECURRENCE_MONTHS = 12;

/** "2026-01-31" + 1 mês → "2026-02-28" (aritmética de calendário, sem fuso). */
export function addMonths(value: string, months: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}
