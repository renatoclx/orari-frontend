import { formatDateOnly } from "@/utils/format";
import { isDateString } from "@/utils/time";

/** Limite do texto da evolução (a API recusa mais que isso). */
export const EVOLUTION_MAX = 10000;

export type EntryFormValues = {
  evolution: string;
  /** "aaaa-mm-dd". */
  consultationDate: string;
  /** Vazio quando não há agendamento vinculado. */
  appointmentId: string;
};

export type EntryFormErrors = Partial<
  Record<"evolution" | "consultationDate", string>
>;

/** Ordem dos campos na tela: o foco vai ao primeiro com erro. */
export const entryFieldOrder = ["evolution", "consultationDate"] as const;

/**
 * Valida o acompanhamento. `today` é o dia de hoje no fuso da empresa e
 * `initialDate` a data do registro inicial da ficha (ambos "aaaa-mm-dd"): a
 * data da consulta não pode ser futura nem anterior ao registro inicial.
 */
export function validateEntryForm(
  values: EntryFormValues,
  today: string,
  initialDate: string,
): EntryFormErrors {
  const errors: EntryFormErrors = {};
  const evolution = values.evolution.trim();
  if (!evolution) {
    errors.evolution = "Descreva a evolução do atendimento.";
  } else if (evolution.length > EVOLUTION_MAX) {
    errors.evolution = `Use no máximo ${EVOLUTION_MAX.toLocaleString("pt-BR")} caracteres.`;
  }

  const date = values.consultationDate;
  if (!isDateString(date)) {
    errors.consultationDate = "Informe a data da consulta.";
  } else if (date > today) {
    errors.consultationDate = "A data da consulta não pode ser futura.";
  } else if (date < initialDate) {
    errors.consultationDate = `A data não pode ser anterior ao registro inicial (${formatDateOnly(`${initialDate}T00:00:00Z`)}).`;
  }
  return errors;
}
