import "server-only";

import { apiFetch } from "@/services/api";
import type {
  CompanySubscriptionItem,
  Subscription,
  SubscriptionInput,
} from "@/types/subscription";

// Assinaturas das empresas (só o SUPER_ADMIN): ver screens/assinaturas.md.

export function listSubscriptions(): Promise<CompanySubscriptionItem[]> {
  return apiFetch<CompanySubscriptionItem[]>("/subscriptions");
}

/** Nula quando a empresa ainda não tem assinatura. */
export async function getSubscription(
  companyId: string,
): Promise<Subscription | null> {
  // Sem assinatura, a API responde sem corpo: chega vazio, não null.
  const subscription = await apiFetch<Subscription | null | "">(
    `/companies/${companyId}/subscription`,
  );
  return subscription || null;
}

export function saveSubscription(
  companyId: string,
  input: SubscriptionInput,
): Promise<Subscription> {
  return apiFetch<Subscription>(`/companies/${companyId}/subscription`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
