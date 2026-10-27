import type { AnamnesisQuestion, AnswerValue } from "@/types/anamnesis";
import { isDateString } from "@/utils/time";

/** Limite de texto de uma resposta (a API recusa mais que isso). */
export const ANSWER_TEXT_MAX = 5000;

/**
 * Resposta como a tela guarda enquanto o profissional digita. Um só formato
 * serve aos 8 tipos: o texto vale para texto curto/longo, escolha única, número,
 * data e escala; os demais campos são do sim ou não e da escolha múltipla.
 */
export type AnswerDraft = {
  text: string;
  yesNo: "" | "yes" | "no";
  detail: string;
  choices: string[];
};

export const emptyDraft = (): AnswerDraft => ({
  text: "",
  yesNo: "",
  detail: "",
  choices: [],
});

/** Valor guardado na API → campo da tela (para mostrar a resposta atual). */
export function draftFromValue(
  question: Pick<AnamnesisQuestion, "type">,
  value: AnswerValue,
): AnswerDraft {
  const draft = emptyDraft();
  switch (question.type) {
    case "YES_NO":
      if (typeof value === "object" && value !== null && "answer" in value) {
        const { answer, detail } = value as {
          answer: unknown;
          detail?: unknown;
        };
        draft.yesNo = answer === true ? "yes" : "no";
        if (typeof detail === "string") draft.detail = detail;
      }
      break;
    case "MULTIPLE_CHOICE":
      if (Array.isArray(value)) {
        draft.choices = value.filter(
          (item): item is string => typeof item === "string",
        );
      }
      break;
    default:
      if (typeof value === "string" || typeof value === "number") {
        draft.text = String(value);
      }
  }
  return draft;
}

export type ParsedAnswer =
  | { kind: "empty" }
  | { kind: "value"; value: AnswerValue }
  | { kind: "error"; message: string };

const empty: ParsedAnswer = { kind: "empty" };
const value = (v: AnswerValue): ParsedAnswer => ({ kind: "value", value: v });
const error = (message: string): ParsedAnswer => ({ kind: "error", message });

/**
 * Campo da tela → valor no formato da API (README da anamnese, tabela por
 * tipo). Campo vazio é `empty`: pergunta opcional sem resposta não vai no
 * envio (nunca como `null`).
 */
export function parseAnswer(
  question: Pick<AnamnesisQuestion, "type" | "options" | "detailLabel">,
  draft: AnswerDraft,
): ParsedAnswer {
  const text = draft.text.trim();
  switch (question.type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
      if (!text) return empty;
      return text.length > ANSWER_TEXT_MAX
        ? error(`Use no máximo ${ANSWER_TEXT_MAX} caracteres.`)
        : value(text);
    case "YES_NO": {
      if (draft.yesNo === "") return empty;
      if (draft.yesNo === "no") return value({ answer: false });
      const detail = draft.detail.trim();
      if (detail.length > ANSWER_TEXT_MAX) {
        return error(`Use no máximo ${ANSWER_TEXT_MAX} caracteres.`);
      }
      // O detalhe só existe se a pergunta o pede e a resposta é "sim".
      return value(
        question.detailLabel && detail
          ? { answer: true, detail }
          : { answer: true },
      );
    }
    case "SINGLE_CHOICE":
      if (!text) return empty;
      return question.options.includes(text)
        ? value(text)
        : error("Escolha uma das opções.");
    case "MULTIPLE_CHOICE":
      if (draft.choices.length === 0) return empty;
      return draft.choices.every((choice) => question.options.includes(choice))
        ? // Na ordem das opções, sem repetir.
          value(question.options.filter((o) => draft.choices.includes(o)))
        : error("Escolha apenas as opções da lista.");
    case "NUMBER": {
      if (!text) return empty;
      const number = Number(text.replace(",", "."));
      return Number.isFinite(number)
        ? value(number)
        : error("Informe um número.");
    }
    case "DATE":
      if (!text) return empty;
      return isDateString(text)
        ? value(text)
        : error("Informe uma data válida.");
    case "SCALE": {
      if (!text) return empty;
      const scale = Number(text);
      return Number.isInteger(scale) && scale >= 0 && scale <= 10
        ? value(scale)
        : error("Escolha um valor de 0 a 10.");
    }
  }
}

// Igualdade de valores guardados (texto, número, lista ou objeto simples).
function sameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => sameValue(item, b[index]))
    );
  }
  if (
    typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null
  ) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every((key) =>
      sameValue(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
    );
  }
  return a === b;
}

export type ChangedAnswers = {
  answers: { questionId: string; value: AnswerValue }[];
  /** Erro por pergunta (pelo id), para mostrar no campo. */
  errors: Record<string, string>;
};

/**
 * Respostas a enviar no acompanhamento: só as que **mudaram** em relação às
 * atuais. Campo vazio não vai (a API não apaga resposta já dada, só atualiza).
 */
export function changedAnswers(
  questions: Pick<
    AnamnesisQuestion,
    "id" | "type" | "options" | "detailLabel"
  >[],
  drafts: Record<string, AnswerDraft>,
  current: Record<string, AnswerValue>,
): ChangedAnswers {
  const result: ChangedAnswers = { answers: [], errors: {} };
  for (const question of questions) {
    const parsed = parseAnswer(question, drafts[question.id] ?? emptyDraft());
    if (parsed.kind === "error") {
      result.errors[question.id] = parsed.message;
    } else if (
      parsed.kind === "value" &&
      !sameValue(parsed.value, current[question.id])
    ) {
      result.answers.push({ questionId: question.id, value: parsed.value });
    }
  }
  return result;
}
