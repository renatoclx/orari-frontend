import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { CommissionItem, CommissionSummary } from "@/types/commission";

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
