import type { TimeRange } from "@/types/agenda";
import { timeToMinutes } from "@/utils/time";

// Hoje, a grade abre meia hora antes de agora: dá para ver o que acabou de
// passar e o que vem em seguida.
const BEFORE_NOW_MINUTES = 30;

type InitialMinuteInput = {
  /** Janela da grade, em minutos desde a meia-noite. */
  range: { start: number; end: number };
  /** Minutos de agora quando o dia exibido é hoje; nulo nos outros dias. */
  nowMinutes: number | null;
  /** Inícios ("HH:mm") dos atendimentos e sessões que contam (sem cancelados). */
  starts: string[];
  /** Trechos fora do expediente: o primeiro, colado ao início, diz a abertura. */
  unavailable: TimeRange[];
};

/**
 * Minuto em que a grade abre (screens/agendamentos.md): hoje, um pouco antes de
 * agora; nos outros dias, no primeiro atendimento ou, sem nenhum, na abertura
 * da clínica. Nunca fora da janela da grade.
 */
export function initialGridMinute({
  range,
  nowMinutes,
  starts,
  unavailable,
}: InitialMinuteInput): number {
  const clamp = (minute: number) =>
    Math.min(Math.max(minute, range.start), range.end);

  if (nowMinutes !== null) return clamp(nowMinutes - BEFORE_NOW_MINUTES);

  if (starts.length > 0) {
    return clamp(Math.min(...starts.map(timeToMinutes)));
  }

  // Abertura: o fim do trecho fechado que começa junto com a grade. Sem
  // nenhuma janela no dia (tudo fechado), fica no começo.
  const closedAtStart = unavailable.find(
    (gap) => timeToMinutes(gap.start) <= range.start,
  );
  const opening = closedAtStart
    ? timeToMinutes(closedAtStart.end)
    : range.start;
  return opening >= range.end ? range.start : clamp(opening);
}
