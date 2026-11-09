import type { TimeRange } from "@/types/agenda";
import type { AgendaBlockInput } from "@/types/agenda-block";
import {
  isDateString,
  minutesToTime,
  timeToMinutes,
  toDateString,
  toTimeString,
} from "@/utils/time";

// Regras puras do bloqueio de horários (screens/agendamentos.md, "Bloquear
// horários"): validação do formulário e o texto de cada bloqueio.

export type AgendaBlockErrors = Partial<Record<keyof AgendaBlockInput, string>>;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Confere o formulário antes da API (que confere de novo). `now` e `timeZone`
 * recusam o horário que já começou, no relógio da empresa.
 */
export function agendaBlockErrors(
  input: AgendaBlockInput,
  now: Date,
  timeZone: string,
): AgendaBlockErrors {
  const errors: AgendaBlockErrors = {};
  if (!isDateString(input.date)) errors.date = "Escolha a data.";
  if (!TIME.test(input.startTime)) errors.startTime = "Informe o início.";
  if (!TIME.test(input.endTime)) errors.endTime = "Informe o fim.";
  if (errors.date || errors.startTime || errors.endTime) return errors;

  if (timeToMinutes(input.endTime) <= timeToMinutes(input.startTime)) {
    errors.endTime = "O fim precisa ser depois do início.";
    return errors;
  }
  const today = toDateString(now, timeZone);
  const nowTime = toTimeString(now.toISOString(), timeZone);
  if (
    input.date < today ||
    (input.date === today && input.startTime < nowTime)
  ) {
    errors.startTime = "Esse horário já começou.";
  }
  return errors;
}

/** "Ter, 10/11/2026 · 14:00 às 16:30", no relógio da empresa. */
export function agendaBlockLabel(
  block: { startAt: string; endAt: string },
  timeZone: string,
): string {
  const start = new Date(block.startAt);
  const format = (options: Intl.DateTimeFormatOptions, instant = start) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone, ...options }).format(instant);
  // "ter." → "Ter"
  const weekDay = format({ weekday: "short" }).replace(".", "");
  const date = format({ day: "2-digit", month: "2-digit", year: "numeric" });
  const time = (instant: Date) =>
    format({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, instant);
  return `${weekDay.charAt(0).toUpperCase()}${weekDay.slice(1)}, ${date} · ${time(start)} às ${time(new Date(block.endAt))}`;
}

/**
 * Bloqueios de um dia como horários "HH:MM" no relógio da empresa, cortados
 * no dia: o que começa antes vira 00:00; o que passa da meia-noite, 24:00.
 */
export function blockRangesOfDay(
  blocks: { startAt: string; endAt: string }[],
  date: string,
  timeZone: string,
): TimeRange[] {
  return blocks
    .filter(
      (block) =>
        toDateString(new Date(block.startAt), timeZone) <= date &&
        toDateString(new Date(block.endAt), timeZone) >= date,
    )
    .map((block) => ({
      start:
        toDateString(new Date(block.startAt), timeZone) < date
          ? "00:00"
          : toTimeString(block.startAt, timeZone),
      end:
        toDateString(new Date(block.endAt), timeZone) > date
          ? "24:00"
          : toTimeString(block.endAt, timeZone),
    }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Janelas de atendimento menos os bloqueios: o bloqueado conta como fora do
 * funcionamento (só o encaixe entra nele), como na API.
 */
export function subtractRanges(
  windows: TimeRange[],
  cuts: TimeRange[],
): TimeRange[] {
  let pieces = windows.map((window) => ({
    start: timeToMinutes(window.start),
    end: timeToMinutes(window.end),
  }));
  for (const cut of cuts) {
    const from = timeToMinutes(cut.start);
    const to = timeToMinutes(cut.end);
    pieces = pieces.flatMap((piece) =>
      to <= piece.start || from >= piece.end
        ? [piece]
        : [
            { start: piece.start, end: Math.min(from, piece.end) },
            { start: Math.max(to, piece.start), end: piece.end },
          ].filter((part) => part.end > part.start),
    );
  }
  return pieces.map((piece) => ({
    start: minutesToTime(piece.start),
    end: minutesToTime(piece.end),
  }));
}
