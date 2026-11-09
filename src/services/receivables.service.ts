import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  ReceivablesDebtor,
  ReceivablesSummary,
} from "@/types/receivables";

/** Resumo do contas a receber; sem período, o mês atual (padrão da API). */
export function getReceivablesSummary(period: {
  from?: string;
  to?: string;
}): Promise<ReceivablesSummary> {
  const query = new URLSearchParams();
  if (period.from) query.set("from", period.from);
  if (period.to) query.set("to", period.to);
  return apiFetch<ReceivablesSummary>(`/receivables?${query}`);
}

/** Clientes com pagamento atrasado, maior valor primeiro, paginados. */
export function listReceivablesDebtors(params: {
  search?: string;
  page: number;
  limit: number;
}): Promise<Paginated<ReceivablesDebtor>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const search = params.search?.trim();
  if (search) query.set("search", search);
  return apiFetch<Paginated<ReceivablesDebtor>>(
    `/receivables/debtors?${query}`,
  );
}
