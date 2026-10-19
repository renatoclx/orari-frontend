import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { PaymentMethodItem } from "@/types/payment-method";

type ListPaymentMethodsParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  /** `true`: só os ativos (ex.: baixa de pagamento). Sem ele, ativos e inativos. */
  isActive?: boolean;
  page: number;
  limit: number;
};

// Ativos e inativos (status pelo deletedAt), em ordem alfabética.
export function listPaymentMethods(
  params: ListPaymentMethodsParams,
): Promise<Paginated<PaymentMethodItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  return apiFetch<Paginated<PaymentMethodItem>>(`/payment-methods?${query}`);
}

/** Cadastro; nome repetido entre os ativos responde 409. */
export async function createPaymentMethod(name: string): Promise<void> {
  await apiFetch("/payment-methods", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updatePaymentMethod(
  id: string,
  name: string,
): Promise<void> {
  await apiFetch(`/payment-methods/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

/** Inativação (exclusão lógica: preenche o deletedAt). */
export async function deletePaymentMethod(id: string): Promise<void> {
  await apiFetch(`/payment-methods/${id}`, { method: "DELETE" });
}

/** Reativação: limpa o deletedAt (409 se o nome já estiver com outro ativo). */
export async function restorePaymentMethod(id: string): Promise<void> {
  await apiFetch(`/payment-methods/${id}/restore`, { method: "PATCH" });
}
