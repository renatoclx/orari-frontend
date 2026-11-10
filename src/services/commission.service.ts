import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  ClosingInput,
  ClosingItem,
  ClosingPreview,
  ClosingReceipt,
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

/**
 * Adiantamentos do profissional: os do período (abertos ou fechados) e os em
 * aberto de qualquer data, do mais recente.
 */
export function listCommissionAdvances(params: {
  professionalId: string;
  from?: string;
  to?: string;
}): Promise<CommissionAdvance[]> {
  const query = new URLSearchParams({ professionalId: params.professionalId });
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return apiFetch<CommissionAdvance[]>(`/commission-advances?${query}`);
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

/** O que está em aberto até a data de corte. */
export function getClosingPreview(
  professionalId: string,
  until: string,
): Promise<ClosingPreview> {
  const query = new URLSearchParams({ professionalId, until });
  return apiFetch<ClosingPreview>(`/commission-closings/preview?${query}`);
}

/** Fecha e devolve o número do recibo. */
export function createClosing(
  input: ClosingInput,
): Promise<{ id: string; number: number }> {
  return apiFetch<{ id: string; number: number }>("/commission-closings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Fechamentos do profissional, do mais recente (inclusive desfeitos). */
export function listClosings(professionalId: string): Promise<ClosingItem[]> {
  return apiFetch<ClosingItem[]>(
    `/commission-closings?professionalId=${encodeURIComponent(professionalId)}`,
  );
}

/** Dados do recibo. */
export function getClosingReceipt(id: string): Promise<ClosingReceipt> {
  return apiFetch<ClosingReceipt>(`/commission-closings/${id}`);
}

/** Desfaz o fechamento (só o último do profissional). */
export async function cancelClosing(id: string): Promise<void> {
  await apiFetch(`/commission-closings/${id}`, { method: "DELETE" });
}
