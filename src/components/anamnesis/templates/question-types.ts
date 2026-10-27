import type { QuestionType } from "@/types/anamnesis";

/** Rótulo de cada tipo de pergunta, na ordem em que aparecem na lista de escolha. */
export const questionTypeLabels: Record<QuestionType, string> = {
  SHORT_TEXT: "Texto curto",
  LONG_TEXT: "Texto longo",
  YES_NO: "Sim ou não",
  SINGLE_CHOICE: "Escolha única",
  MULTIPLE_CHOICE: "Escolha múltipla",
  NUMBER: "Número",
  DATE: "Data",
  SCALE: "Escala de 0 a 10",
};

export const questionTypes = Object.keys(questionTypeLabels) as QuestionType[];

/** Tipos que pedem uma lista de opções. */
export const isChoiceType = (type: QuestionType) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";
