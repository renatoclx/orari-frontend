import type { PeriodAvailability } from "@/app/(admin)/appointment-actions";
import { availableStarts } from "@/components/agenda/agenda-availability";
import type { TimeRange } from "@/types/agenda";
import type { WeekDay } from "@/types/business-hour";
import { shiftDateString, weekDayOf } from "@/utils/time";

/** Datas ("aaaa-mm-dd") de um dia da semana entre `startDate` e `endDate`. */
export function datesOnWeekDay(
  startDate: string,
  endDate: string,
  weekDay: WeekDay,
): string[] {
  const dates: string[] = [];
  let date = startDate;
  // Primeira data no dia da semana, depois de 7 em 7 dias.
  for (let i = 0; i < 7 && weekDayOf(date) !== weekDay; i++) {
    date = shiftDateString(date, 1);
  }
  for (; date <= endDate; date = shiftDateString(date, 7)) dates.push(date);
  return dates;
}

/**
 * Horários de início (minutos) livres em TODAS as datas do dia da semana no
 * período: cabem na janela do dia, não conflitam com agendamentos do
 * profissional ou do cliente nem com `extraBusy` (sessões já escolhidas na mesma
 * tela) e não estão no passado. Datas já passadas do período são ignoradas.
 */
export function periodStarts({
  availability,
  weekDay,
  startDate,
  endDate,
  duration,
  extraBusy = [],
}: {
  availability: PeriodAvailability;
  weekDay: WeekDay;
  startDate: string;
  endDate: string;
  duration: number;
  extraBusy?: TimeRange[];
}): number[] {
  const windows = availability.windows[weekDay] ?? [];
  const dates = datesOnWeekDay(startDate, endDate, weekDay).filter(
    (date) => date >= availability.today,
  );
  if (dates.length === 0 || windows.length === 0) return [];

  // Começa com os horários da primeira data e mantém só os que valem nas demais.
  let common: number[] | undefined;
  for (const date of dates) {
    const starts = availableStarts({
      windows,
      busy: [...(availability.busy[date] ?? []), ...extraBusy],
      duration,
      notBefore: date === availability.today ? availability.nowMinutes + 1 : 0,
    });
    common = common ? common.filter((start) => starts.includes(start)) : starts;
    if (common.length === 0) return [];
  }
  return common ?? [];
}
