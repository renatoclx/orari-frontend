import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { PaymentItem } from "@/types/payment";

// Máximo que a API aceita por página.
const PAGE_SIZE = 100;

/** Pagamentos (parcelas) de uma contratação, por vencimento. */
export async function listClientPlanPayments(
  clientPlanId: string,
): Promise<PaymentItem[]> {
  const items: PaymentItem[] = [];
  for (let page = 1; ; page++) {
    const query = new URLSearchParams({
      clientPlanId,
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const result = await apiFetch<Paginated<PaymentItem>>(`/payments?${query}`);
    items.push(...result.items);
    if (items.length >= result.total || result.items.length === 0) break;
  }
  // A data de vencimento é de calendário: "aaaa-mm-dd".
  return items.map((item) => ({
    ...item,
    dueDate: item.dueDate && item.dueDate.slice(0, 10),
  }));
}

/** Pagamentos de um cliente (avulsos e parcelas de pacote), por vencimento. */
export async function listClientPayments(params: {
  clientId: string;
  page: number;
  limit: number;
}): Promise<Paginated<PaymentItem>> {
  const query = new URLSearchParams({
    clientId: params.clientId,
    page: String(params.page),
    limit: String(params.limit),
  });
  const result = await apiFetch<Paginated<PaymentItem>>(`/payments?${query}`);
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      dueDate: item.dueDate && item.dueDate.slice(0, 10),
    })),
  };
}
