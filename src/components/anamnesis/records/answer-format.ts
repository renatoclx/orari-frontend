import type { AnamnesisQuestion, AnswerValue } from "@/types/anamnesis";
import { formatDateOnly } from "@/utils/format";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Texto de uma resposta, conforme o tipo da pergunta. Devolve `null` quando o
 * valor não tem o formato esperado: a tela mostra um traço em vez de quebrar,
 * e nunca despeja o valor cru.
 */
export function formatAnswer(
  question: Pick<AnamnesisQuestion, "type">,
  value: AnswerValue,
): string | null {
  switch (question.type) {
    case "SHORT_TEXT":
    case "LONG_TEXT":
    case "SINGLE_CHOICE":
      return typeof value === "string" && value !== "" ? value : null;
    case "YES_NO": {
      if (!isRecord(value) || typeof value.answer !== "boolean") return null;
      if (!value.answer) return "Não";
      return typeof value.detail === "string" && value.detail !== ""
        ? `Sim: ${value.detail}`
        : "Sim";
    }
    case "MULTIPLE_CHOICE":
      return Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === "string")
        ? value.join(", ")
        : null;
    case "NUMBER":
      return typeof value === "number" && Number.isFinite(value)
        ? new Intl.NumberFormat("pt-BR").format(value)
        : null;
    case "DATE":
      // Data pura "AAAA-MM-DD": lida em UTC para não voltar um dia.
      return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? formatDateOnly(`${value}T00:00:00Z`)
        : null;
    case "SCALE":
      return typeof value === "number" && Number.isInteger(value)
        ? `${value} de 10`
        : null;
  }
}
