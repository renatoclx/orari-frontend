import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  CommissionAdvance,
  CommissionAdvanceInput,
  CommissionItem,
  CommissionSummary,
} from "@/types/commission";

type CommissionFilters = {
  /** "aaaa-mm-dd"; sem as duas, o mês atual. */
  from?: string;
  to?: string;
  professionalId?: string;
};

function filtersQuery({ from, to, professionalId }: CommissionFilters) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (professionalId) query.set("professionalId", professionalId);
  return query;
}

/** Totais do período, no geral e por profissional. */
export function getCommissionSummary(
  filters: CommissionFilters,
): Promise<CommissionSummary> {
  const query = filtersQuery(filters).toString();
  return apiFetch<CommissionSummary>(
    `/commissions/summary${query ? `?${query}` : ""}`,
  );
}

/** Atendimento a atendimento, do mais recente para o mais antigo. */
export function listCommissions(
  filters: CommissionFilters & { page: number; limit: number },
): Promise<Paginated<CommissionItem>> {
  const query = filtersQuery(filters);
  query.set("page", String(filters.page));
  query.set("limit", String(filters.limit));
  return apiFetch<Paginated<CommissionItem>>(`/commissions?${query}`);
}

/** Adiantamentos em aberto do profissional, do mais recente. */
export function listCommissionAdvances(
  professionalId: string,
): Promise<CommissionAdvance[]> {
  return apiFetch<CommissionAdvance[]>(
    `/commission-advances?professionalId=${encodeURIComponent(professionalId)}`,
  );
}

/** Disponível para adiantar (comissão em aberto − adiantado). */
export function getAdvanceAvailable(
  professionalId: string,
): Promise<{ available: string }> {
  return apiFetch<{ available: string }>(
    `/commission-advances/available?professionalId=${encodeURIComponent(professionalId)}`,
  );
}

export function createCommissionAdvance(
  input: CommissionAdvanceInput,
): Promise<CommissionAdvance> {
  return apiFetch<CommissionAdvance>("/commission-advances", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteCommissionAdvance(id: string): Promise<void> {
  return apiFetch<void>(`/commission-advances/${id}`, { method: "DELETE" });
}
