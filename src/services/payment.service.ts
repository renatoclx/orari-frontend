import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  CheckoutItem,
  PaymentItem,
  PaymentStatus,
  PaymentSummary,
} from "@/types/payment";

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

/** Comandas do dia, uma por cliente, em ordem alfabética (paginadas por cliente). */
export async function listCheckouts(params: {
  search?: string;
  page: number;
  limit: number;
}): Promise<Paginated<CheckoutItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const search = params.search?.trim();
  if (search) query.set("search", search);

  const result = await apiFetch<Paginated<CheckoutItem>>(
    `/payments/checkouts?${query}`,
  );
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      payments: item.payments.map((payment) => ({
        ...payment,
        dueDate: payment.dueDate && payment.dueDate.slice(0, 10),
      })),
    })),
  };
}

/**
 * Baixa de vários pagamentos do mesmo cliente com o mesmo método, de uma vez:
 * ou todos ficam pagos, ou nenhum.
 */
export async function settlePayments(input: {
  paymentIds: string[];
  paymentMethodId: string;
  /** Instante do pagamento; sem ele, a API usa o momento da requisição. */
  paidAt?: string;
}): Promise<void> {
  await apiFetch("/payments/settle", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// Vencimento é data de calendário: "aaaa-mm-dd".
function withDueDate(item: PaymentItem): PaymentItem {
  return { ...item, dueDate: item.dueDate && item.dueDate.slice(0, 10) };
}

type PaymentFilters = {
  /** Período de vencimento, "aaaa-mm-dd", com as duas pontas incluídas. */
  dueFrom?: string;
  dueTo?: string;
  clientId?: string;
};

type ListPaymentsParams = PaymentFilters & {
  status?: PaymentStatus;
  /** `true`: só os pendentes já vencidos. */
  overdue?: boolean;
  paymentMethodId?: string;
  page: number;
  limit: number;
};

/** Pagamentos da empresa, o vencimento mais próximo primeiro (tela de Pagamentos). */
export async function listPayments(
  params: ListPaymentsParams,
): Promise<Paginated<PaymentItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.status) query.set("status", params.status);
  if (params.overdue !== undefined) {
    query.set("overdue", String(params.overdue));
  }
  if (params.clientId) query.set("clientId", params.clientId);
  if (params.paymentMethodId) {
    query.set("paymentMethodId", params.paymentMethodId);
  }
  if (params.dueFrom) query.set("dueFrom", params.dueFrom);
  if (params.dueTo) query.set("dueTo", params.dueTo);

  const result = await apiFetch<Paginated<PaymentItem>>(`/payments?${query}`);
  return { ...result, items: result.items.map(withDueDate) };
}

/** Totais por situação, para o resumo; respeita cliente e vencimento, não o status. */
export function getPaymentSummary(
  filters: PaymentFilters,
): Promise<PaymentSummary> {
  const query = new URLSearchParams();
  if (filters.clientId) query.set("clientId", filters.clientId);
  if (filters.dueFrom) query.set("dueFrom", filters.dueFrom);
  if (filters.dueTo) query.set("dueTo", filters.dueTo);

  return apiFetch<PaymentSummary>(`/payments/summary?${query}`);
}
