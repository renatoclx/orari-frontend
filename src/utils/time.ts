import type { WeekDay } from "@/types/business-hour";

// A API trabalha em UTC; a interface exibe no fuso da empresa.
const TIME_ZONE = "America/Sao_Paulo";

/** "09:30" → 570 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** 570 → "09:30" */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** "Segunda-feira, 12 de outubro" */
export function formatLongDate(date: Date): string {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  }).format(date);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Dia da semana na ordem de Date#getUTCDay (0 = domingo).
const WEEK_DAYS: WeekDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

/** "2026-10-14" é uma data de calendário válida? */
export function isDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Dia de calendário ("aaaa-mm-dd") em que o instante cai no fuso informado. */
export function toDateString(instant: Date, timeZone: string): string {
  // O locale sv-SE já formata como aaaa-mm-dd.
  return new Intl.DateTimeFormat("sv-SE", { timeZone }).format(instant);
}

/** "2026-10-14" + 1 → "2026-10-15" (aritmética de calendário, sem fuso). */
export function shiftDateString(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Dia da semana de uma data de calendário. */
export function weekDayOf(value: string): WeekDay {
  return WEEK_DAYS[new Date(`${value}T00:00:00Z`).getUTCDay()];
}

// Diferença, em minutos, entre o relógio do fuso e o UTC naquele instante.
function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)?.value);

  const asUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return Math.round(
    (asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60000,
  );
}

// Instante (UTC) da meia-noite de uma data de calendário no fuso informado.
function startOfDay(value: string, timeZone: string): Date {
  const guess = Date.parse(`${value}T00:00:00Z`);
  const first = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  // Confere de novo: perto de uma mudança de horário o primeiro cálculo erra.
  const second = guess - offsetMinutes(new Date(first), timeZone) * 60000;
  return new Date(second);
}

/**
 * Início e fim (UTC) de um dia no fuso da empresa, para filtrar a API:
 * from <= início do agendamento < to.
 */
export function dayBounds(
  value: string,
  timeZone: string,
): { from: Date; to: Date } {
  return {
    from: startOfDay(value, timeZone),
    to: startOfDay(shiftDateString(value, 1), timeZone),
  };
}

/** "2026-10-14T17:30:00.000Z" → "14:30" (no fuso informado). */
export function toTimeString(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
