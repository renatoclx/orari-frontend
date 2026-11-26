import { shiftDateString } from "@/utils/time";

// Faixa de dias das agendas (app do profissional e painel no celular): uma
// semana para trás (rever o que passou) e um mês para frente; o calendário
// cobre o resto.
const STRIP_BEFORE = 7;
const STRIP_AFTER = 30;

/**
 * Dias da faixa: em volta de hoje e, se o dia aberto ficou fora (escolhido no
 * calendário), em volta dele, para ele aparecer na faixa.
 */
export function dayStripDays(day: string, today: string): string[] {
  const first = shiftDateString(today, -STRIP_BEFORE);
  const last = shiftDateString(today, STRIP_AFTER);
  const anchor = day >= first && day <= last ? today : day;
  return Array.from({ length: STRIP_BEFORE + STRIP_AFTER + 1 }, (_, index) =>
    shiftDateString(anchor, index - STRIP_BEFORE),
  );
}
