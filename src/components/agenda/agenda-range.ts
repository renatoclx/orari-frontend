import type { TimeRange } from "@/types/agenda";
import { minutesToTime, timeToMinutes } from "@/utils/time";

const SLOT_MINUTES = 30;
const DAY_MINUTES = 24 * 60;

// Folga exibida antes da abertura e depois do fechamento (screens/agendamentos.md).
const MARGIN_MINUTES = 2 * 60;

// Janela padrão para o dia sem horário de funcionamento e sem agendamentos.
const DEFAULT_START = timeToMinutes("07:00");
const DEFAULT_END = timeToMinutes("20:00");

/** Janela visível da grade, em minutos desde a meia-noite. */
export type GridRange = { start: number; end: number };

/**
 * Da abertura mais cedo, menos 2 horas, ao fechamento mais tarde, mais 2
 * horas. Agendamentos fora dessa janela a ampliam (nunca ficam de fora), e os
 * limites se alinham aos intervalos de 30 minutos.
 */
export function computeGridRange(
  businessHours: TimeRange[],
  appointments: TimeRange[],
): GridRange {
  const opens = businessHours.map((range) => timeToMinutes(range.start));
  const closes = businessHours.map((range) => timeToMinutes(range.end));

  let start = opens.length
    ? Math.min(...opens) - MARGIN_MINUTES
    : DEFAULT_START;
  let end = closes.length ? Math.max(...closes) + MARGIN_MINUTES : DEFAULT_END;

  for (const appointment of appointments) {
    start = Math.min(start, timeToMinutes(appointment.start));
    end = Math.max(end, timeToMinutes(appointment.end));
  }

  start = Math.max(0, Math.floor(start / SLOT_MINUTES) * SLOT_MINUTES);
  end = Math.min(DAY_MINUTES, Math.ceil(end / SLOT_MINUTES) * SLOT_MINUTES);
  return { start, end };
}

/** Áreas da grade que não são horário de atendimento. */
export type GridAreas = {
  /** Fora do expediente (antes da abertura e depois do fechamento): hachurado. */
  outside: TimeRange[];
  /** Intervalos entre janelas de atendimento (almoço, por exemplo): cinza. */
  breaks: TimeRange[];
};

/**
 * Separa o que não é atendimento em "fora do expediente" e "intervalos".
 * Sem horário no dia (empresa fechada), a janela inteira é "fora".
 */
export function gridAreas(
  businessHours: TimeRange[],
  range: GridRange,
): GridAreas {
  const windows = businessHours
    .map((hours) => ({
      start: timeToMinutes(hours.start),
      end: timeToMinutes(hours.end),
    }))
    .sort((a, b) => a.start - b.start);

  const toRange = (start: number, end: number): TimeRange[] =>
    end > start
      ? [{ start: minutesToTime(start), end: minutesToTime(end) }]
      : [];

  if (windows.length === 0) {
    return { outside: toRange(range.start, range.end), breaks: [] };
  }

  const open = windows[0].start;
  const close = Math.max(...windows.map((window) => window.end));

  // Intervalos: o que sobra entre janelas, dentro do expediente.
  const breaks: TimeRange[] = [];
  let cursor = open;
  for (const window of windows) {
    if (window.start > cursor) {
      breaks.push(...toRange(cursor, window.start));
    }
    cursor = Math.max(cursor, window.end);
  }

  return {
    outside: [
      ...toRange(range.start, Math.min(open, range.end)),
      ...toRange(Math.max(close, range.start), range.end),
    ],
    breaks,
  };
}
