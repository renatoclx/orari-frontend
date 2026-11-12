import { dayChip } from "@/components/client-app/client-app";
import type { ProfessionalHome } from "@/types/professional-app";

// Regras puras do Início do profissional (screens/app-profissional.md).

/** Uma barra do gráfico da semana. */
export type WeekBar = {
  date: string;
  /** "seg", "ter"... */
  weekday: string;
  /** Dia do mês: "12". */
  day: string;
  count: number;
  /** Já passou, é hoje ou ainda vai acontecer. */
  state: "past" | "today" | "future";
  /** Altura da barra, de 0 a 100 (relativa ao dia mais cheio). */
  height: number;
};

/**
 * As barras da semana. A altura é proporcional ao dia mais cheio; o dia sem
 * atendimentos tem altura 0 (a tela desenha só uma marca).
 */
export function weekBars(
  week: ProfessionalHome["week"],
  today: string,
): WeekBar[] {
  const max = Math.max(...week.map((item) => item.count), 0);
  return week.map(({ date, count }) => {
    const { weekday, day } = dayChip(date);
    return {
      date,
      weekday,
      day,
      count,
      state: date === today ? "today" : date < today ? "past" : "future",
      height: max === 0 ? 0 : Math.round((count / max) * 100),
    };
  });
}

/** O gráfico em palavras, para leitor de tela: "seg 12: 2; ter 13: 0; ...". */
export function weekDescription(bars: WeekBar[]): string {
  return bars
    .map((bar) => `${bar.weekday} ${bar.day}: ${bar.count}`)
    .join("; ");
}

/** O total da semana (cancelados fora). */
export function weekTotal(week: ProfessionalHome["week"]): number {
  return week.reduce((sum, item) => sum + item.count, 0);
}

/** A comparação com o mês anterior: "+3 que no mês anterior", "igual ao mês anterior". */
export function comparison(
  current: number,
  previous: number,
): {
  text: string;
  tone: "up" | "down" | "same";
} {
  const diff = current - previous;
  if (diff === 0) return { text: "Igual ao mês anterior", tone: "same" };
  return {
    text: `${diff > 0 ? "+" : "−"}${Math.abs(diff)} que no mês anterior`,
    tone: diff > 0 ? "up" : "down",
  };
}

/** "1 atendimento" / "3 atendimentos". */
export function attendanceCount(count: number): string {
  return count === 1 ? "1 atendimento" : `${count} atendimentos`;
}
