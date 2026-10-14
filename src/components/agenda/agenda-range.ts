import type { TimeRange } from "@/types/agenda";
import { minutesToTime, timeToMinutes } from "@/utils/time";

const SLOT_MINUTES = 30;
const DAY_MINUTES = 24 * 60;

// Folga exibida antes da abertura e depois do fechamento (screens.md).
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

/**
 * Trechos da janela fora do horário de funcionamento. Sem horário no dia
 * (empresa fechada), a janela inteira é indisponível.
 */
export function unavailableRanges(
  businessHours: TimeRange[],
  range: GridRange,
): TimeRange[] {
  const open = businessHours
    .map((hours) => ({
      start: timeToMinutes(hours.start),
      end: timeToMinutes(hours.end),
    }))
    .sort((a, b) => a.start - b.start);

  const gaps: TimeRange[] = [];
  let cursor = range.start;

  for (const window of open) {
    if (window.start > cursor) {
      gaps.push({
        start: minutesToTime(cursor),
        end: minutesToTime(Math.min(window.start, range.end)),
      });
    }
    cursor = Math.max(cursor, window.end);
  }

  if (cursor < range.end) {
    gaps.push({ start: minutesToTime(cursor), end: minutesToTime(range.end) });
  }
  return gaps.filter(
    (gap) => timeToMinutes(gap.end) > timeToMinutes(gap.start),
  );
}
