import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  PayableApiStatus,
  PayableInput,
  PayableItem,
  PayableSummary,
} from "@/types/payable";

type PayableFilters = {
  payeeId?: string;
  categoryId?: string;
  dueFrom?: string;
  dueTo?: string;
};

function filtersQuery(filters: PayableFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }
  return query;
}

/** Atrasado, a vencer e pago com os mesmos filtros da lista. */
export function getPayableSummary(
  filters: PayableFilters,
): Promise<PayableSummary> {
  const query = filtersQuery(filters).toString();
  return apiFetch<PayableSummary>(
    `/payables/summary${query ? `?${query}` : ""}`,
  );
}

export function listPayables(
  params: PayableFilters & {
    status: PayableApiStatus;
    page: number;
    limit: number;
  },
): Promise<Paginated<PayableItem>> {
  const query = filtersQuery(params);
  query.set("status", params.status);
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  return apiFetch<Paginated<PayableItem>>(`/payables?${query}`);
}

export async function createPayable(input: PayableInput): Promise<void> {
  await apiFetch("/payables", { method: "POST", body: JSON.stringify(input) });
}

/** Altera só esta conta (pendente). */
export async function updatePayable(
  id: string,
  input: Omit<PayableInput, "repeat" | "paid">,
): Promise<void> {
  await apiFetch(`/payables/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function settlePayables(input: {
  ids: string[];
  paidAt: string;
  paymentMethodId: string;
}): Promise<void> {
  await apiFetch("/payables/settle", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function cancelPayable(id: string): Promise<void> {
  await apiFetch(`/payables/${id}/cancel`, { method: "PATCH" });
}

export async function deletePayable(id: string): Promise<void> {
  await apiFetch(`/payables/${id}`, { method: "DELETE" });
}
