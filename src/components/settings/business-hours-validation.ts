import type { WeekDay } from "@/types/business-hour";
import { timeToMinutes } from "@/utils/time";

/** Janela como o formulário a edita; sem `id`, é nova. */
export type BusinessHourDraft = {
  /** Chave da linha na tela (o `id` da API ou um temporário). */
  key: string;
  id?: string;
  weekDay: WeekDay;
  openAt: string;
  closeAt: string;
};

/**
 * Mesmas regras do backend: abertura antes do fechamento e janelas do mesmo dia
 * sem sobreposição (encostar é permitido: 12:00–13:00 e 13:00–18:00). Devolve o
 * erro de cada janela, pela chave.
 */
export function validateBusinessHours(
  drafts: BusinessHourDraft[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const draft of drafts) {
    if (!draft.openAt || !draft.closeAt) {
      errors[draft.key] = "Informe a abertura e o fechamento.";
    } else if (timeToMinutes(draft.openAt) >= timeToMinutes(draft.closeAt)) {
      errors[draft.key] = "A abertura deve ser antes do fechamento.";
    }
  }

  const valid = drafts.filter((draft) => !errors[draft.key]);
  for (const a of valid) {
    const overlaps = valid.some(
      (b) =>
        b.key !== a.key &&
        b.weekDay === a.weekDay &&
        timeToMinutes(a.openAt) < timeToMinutes(b.closeAt) &&
        timeToMinutes(b.openAt) < timeToMinutes(a.closeAt),
    );
    if (overlaps)
      errors[a.key] = "Esta janela se sobrepõe a outra do mesmo dia.";
  }

  return errors;
}
