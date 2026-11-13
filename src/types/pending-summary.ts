import type { SummaryItem } from "@/types/auto-message";

/** Pendências de hoje da clínica (GET /pending-summary): só os itens que o plano libera. */
export type PendingSummary = {
  /** O dia, no calendário da clínica (AAAA-MM-DD). */
  date: string;
  items: { item: SummaryItem; count: number }[];
};
