import { formatPercent, formatPrice } from "@/utils/format";

// Regras puras das Comissões do app do profissional (screens/app-profissional.md).

const MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/;

/** O mês da URL (`?mes=`), ou nada se não for AAAA-MM. */
export function parseMonthParam(value: unknown): string | undefined {
  return typeof value === "string" && MONTH_FORMAT.test(value)
    ? value
    : undefined;
}

/** O mês `delta` meses depois (ou antes, se negativo) de "AAAA-MM". */
export function shiftMonth(month: string, delta: number): string {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, number - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

/** O mês atual no relógio da clínica, como "AAAA-MM". */
export function currentMonth(timeZone: string, now = new Date()): string {
  // O locale sv-SE escreve a data como AAAA-MM-DD.
  return new Intl.DateTimeFormat("sv-SE", { timeZone }).format(now).slice(0, 7);
}

/** "2026-11" → "Novembro de 2026". */
export function monthLabel(month: string): string {
  const text = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${month}-01T12:00:00Z`));
  // O Intl escreve "novembro de 2026".
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A regra que gerou a comissão: "30% de R$ 180,00" ou "Valor fixo". */
export function ruleLabel(item: {
  type: "PERCENT" | "FIXED";
  rate: string;
  baseAmount: string;
}): string {
  if (item.type === "FIXED") return "Valor fixo";
  return `${formatPercent(Number(item.rate) / 100)} de ${formatPrice(item.baseAmount)}`;
}

/** "0007": o número do recibo com zeros à esquerda, como no recibo impresso. */
export function receiptNumber(number: number): string {
  return String(number).padStart(4, "0");
}

/** Quantos atendimentos do recibo aparecem antes de "Ver todos". */
export const RECEIPT_PREVIEW = 10;
