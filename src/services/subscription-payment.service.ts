import "server-only";

import { apiFetch } from "@/services/api";
import type {
  CompanyPayments,
  MonthPayments,
  SubscriptionPaymentInput,
} from "@/types/subscription-payment";

// Cobranças das assinaturas (só o SUPER_ADMIN): ver screens/cobrancas.md.

/** Pagamentos de um mês ("aaaa-mm"), de todas as empresas. */
export function listPaymentsByMonth(month: string): Promise<MonthPayments> {
  return apiFetch<MonthPayments>(
    `/subscription-payments?month=${encodeURIComponent(month)}`,
  );
}

export function listCompanyPayments(
  companyId: string,
): Promise<CompanyPayments> {
  return apiFetch<CompanyPayments>(
    `/companies/${companyId}/subscription/payments`,
  );
}

export async function createSubscriptionPayment(
  companyId: string,
  input: SubscriptionPaymentInput,
): Promise<void> {
  await apiFetch(`/companies/${companyId}/subscription/payments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function removeSubscriptionPayment(
  companyId: string,
  paymentId: string,
): Promise<void> {
  await apiFetch(`/companies/${companyId}/subscription/payments/${paymentId}`, {
    method: "DELETE",
  });
}
