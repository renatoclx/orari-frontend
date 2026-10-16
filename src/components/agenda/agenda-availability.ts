import type { TimeRange } from "@/types/agenda";
import { timeToMinutes } from "@/utils/time";

// Passo da grade de horários de início (a imagem de referência usa 15 min).
const STEP_MINUTES = 15;

export type Period = "morning" | "afternoon" | "night";

/** Períodos do dia, na ordem em que aparecem na caixa de seleção. */
export const PERIODS: { id: Period; label: string }[] = [
  { id: "morning", label: "Manhã" },
  { id: "afternoon", label: "Tarde" },
  { id: "night", label: "Noite" },
];

/** Manhã até 11:59, tarde de 12:00 a 17:59 e noite a partir das 18:00. */
export function periodOf(minutes: number): Period {
  if (minutes < 12 * 60) return "morning";
  if (minutes < 18 * 60) return "afternoon";
  return "night";
}

type Interval = { start: number; end: number };

const toInterval = (range: TimeRange): Interval => ({
  start: timeToMinutes(range.start),
  end: timeToMinutes(range.end),
});

/**
 * Horários de início possíveis para um serviço de `duration` minutos.
 *
 * Candidatos: a grade de 15 minutos, o começo de cada janela e o fim de cada
 * agendamento do profissional (assim sobra o "horário quebrado": um serviço
 * curto cabe logo depois de outro, mesmo fora da grade). Vale o candidato em que
 * o atendimento inteiro cabe em UMA janela de atendimento (regra do backend), não
 * sobrepõe agendamento do profissional e não é anterior a `notBefore`.
 */
export function availableStarts({
  windows,
  busy,
  duration,
  notBefore,
}: {
  windows: TimeRange[];
  busy: TimeRange[];
  duration: number;
  /** Primeiro minuto do dia ainda permitido (o passado não se agenda). */
  notBefore: number;
}): number[] {
  const open = windows.map(toInterval);
  const taken = busy.map(toInterval);

  const candidates = new Set<number>();
  for (const window of open) {
    candidates.add(window.start);
    const first = Math.ceil(window.start / STEP_MINUTES) * STEP_MINUTES;
    for (let t = first; t < window.end; t += STEP_MINUTES) candidates.add(t);
  }
  for (const appointment of taken) candidates.add(appointment.end);

  return [...candidates]
    .filter((start) => {
      const end = start + duration;
      return (
        start >= notBefore &&
        open.some((window) => start >= window.start && end <= window.end) &&
        !taken.some((other) => start < other.end && end > other.start)
      );
    })
    .sort((a, b) => a - b);
}

const DAY_MINUTES = 24 * 60;

/**
 * Horários de início possíveis para um ENCAIXE de `duration` minutos: o
 * atendimento inteiro fica fora de qualquer janela de atendimento (inclusive o
 * intervalo entre janelas), termina até a meia-noite, não sobrepõe agendamento
 * do profissional e não é anterior a `notBefore`. Candidatos: a grade de 15
 * minutos, o fim de cada janela e o fim de cada agendamento.
 */
export function availableOverbookingStarts({
  windows,
  busy,
  duration,
  notBefore,
}: {
  windows: TimeRange[];
  busy: TimeRange[];
  duration: number;
  notBefore: number;
}): number[] {
  const open = windows.map(toInterval);
  const taken = busy.map(toInterval);

  const candidates = new Set<number>();
  for (let t = 0; t < DAY_MINUTES; t += STEP_MINUTES) candidates.add(t);
  for (const window of open) candidates.add(window.end);
  for (const appointment of taken) candidates.add(appointment.end);

  return [...candidates]
    .filter((start) => {
      const end = start + duration;
      return (
        start >= notBefore &&
        end <= DAY_MINUTES &&
        !open.some((window) => start < window.end && end > window.start) &&
        !taken.some((other) => start < other.end && end > other.start)
      );
    })
    .sort((a, b) => a - b);
}
