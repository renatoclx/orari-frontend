// Conferência do adiantamento, na tela e de novo na Server Action.
import { isDateString } from "@/utils/time";

export type AdvanceFormValues = {
  professionalId: string;
  /** Centavos, só dígitos. */
  cents: string;
  /** "aaaa-mm-dd". */
  date: string;
};

export type AdvanceField = keyof AdvanceFormValues;
export type AdvanceErrors = Partial<Record<AdvanceField, string>>;

// Ordem dos campos no diálogo: o foco vai para o primeiro inválido.
export const advanceFieldOrder: AdvanceField[] = [
  "professionalId",
  "date",
  "cents",
];

/**
 * Profissional e data obrigatórios (data até hoje); valor maior que zero e,
 * quando o disponível é conhecido, até ele (a API confere de novo).
 */
export function validateAdvance(
  values: AdvanceFormValues,
  today: string,
  availableCents: number | null,
): AdvanceErrors {
  const errors: AdvanceErrors = {};
  if (!values.professionalId) errors.professionalId = "Escolha o profissional.";
  if (!isDateString(values.date)) errors.date = "Informe a data.";
  else if (values.date > today) errors.date = "A data não pode ser futura.";
  const cents = Number(values.cents || 0);
  if (cents <= 0) errors.cents = "Informe o valor.";
  else if (availableCents !== null && cents > availableCents) {
    errors.cents = "O valor passa do disponível para adiantar.";
  }
  return errors;
}
