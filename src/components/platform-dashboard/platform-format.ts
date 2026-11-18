import type { PlatformStatusKey } from "@/types/platform-dashboard";

// Textos e cores do Painel da plataforma (screens/painel.md).

const MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-11" → "nov/26" (eixo dos gráficos). */
export function monthLabel(month: string): string {
  return `${MONTHS[Number(month.slice(5, 7)) - 1]}/${month.slice(2, 4)}`;
}

/** "2026-11" → "novembro de 2026" (dica do gráfico). */
export function monthLongLabel(month: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Há quanto tempo foi a última atividade, em dias de calendário: "hoje",
 * "ontem", "há 5 dias"; sem atividade, "nunca".
 */
export function lastActivityText(iso: string | null, now = new Date()): string {
  if (!iso) return "nunca";
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

/** Dias de "hoje" até a data ("aaaa-mm-dd"), em dias de calendário. */
export function daysUntil(dateIso: string, todayIso: string): number {
  return Math.round(
    (Date.parse(`${dateIso}T00:00:00Z`) - Date.parse(`${todayIso}T00:00:00Z`)) /
      DAY_MS,
  );
}

/** "hoje", "amanhã", "em 3 dias"; no passado, "há 2 dias". */
export function dueText(dateIso: string, todayIso: string): string {
  const days = daysUntil(dateIso, todayIso);
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days > 1) return `em ${days} dias`;
  return days === -1 ? "ontem" : `há ${-days} dias`;
}

/**
 * Situação das empresas: rótulo e cor (tokens de gráfico do globals.css, os
 * mesmos validados para daltonismo). A cor nunca vem sozinha: a legenda traz
 * o nome e o número.
 */
export const STATUS_SERIES: Record<
  PlatformStatusKey,
  { label: string; color: string }
> = {
  TRIAL: { label: "Em teste", color: "var(--chart-info)" },
  ACTIVE: { label: "Ativas", color: "var(--chart-positive)" },
  OVERDUE: { label: "Em atraso", color: "var(--chart-aging-1)" },
  READ_ONLY: { label: "Somente leitura", color: "var(--chart-negative)" },
  CANCELED: { label: "Canceladas", color: "var(--chart-aging-4)" },
  NONE: { label: "Sem assinatura", color: "var(--muted-foreground)" },
};
