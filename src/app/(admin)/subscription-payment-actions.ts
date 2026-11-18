"use server";

import { revalidatePath } from "next/cache";
import {
  toPaymentInput,
  validatePaymentForm,
  type PaymentFormValues,
} from "@/components/subscription-payments/payment-form";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  createSubscriptionPayment,
  listCompanyPayments,
  removeSubscriptionPayment,
} from "@/services/subscription-payment.service";
import type { CompanyPayments } from "@/types/subscription-payment";

// Cobranças das assinaturas, só do SUPER_ADMIN (screens/cobrancas.md).

export type PaymentActionResult = { ok: true } | ActionFailure;

// A API recusa quem não é SUPER_ADMIN; conferir aqui evita chamá-la.
async function ensureSuperAdmin(): Promise<ActionFailure | null> {
  const { type } = await getCurrentUser();
  return type === "SUPER_ADMIN"
    ? null
    : { ok: false, message: "Só o super administrador gerencia cobranças." };
}

// Telas que mostram o "pago até" ou os pagamentos: voltam a buscar.
function refreshScreens() {
  revalidatePath("/cobrancas");
  revalidatePath("/assinaturas");
  revalidatePath("/painel");
}

/** Histórico da empresa e a sugestão do próximo pagamento (abre o diálogo). */
export async function getCompanyPaymentsAction(
  companyId: string,
): Promise<{ ok: true; data: CompanyPayments } | ActionFailure> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId)) return { ok: false, message: "Empresa inválida." };
  try {
    return { ok: true, data: await listCompanyPayments(companyId) };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function createPaymentAction(
  companyId: string,
  values: PaymentFormValues,
): Promise<PaymentActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId)) return { ok: false, message: "Empresa inválida." };
  if (Object.keys(validatePaymentForm(values)).length > 0) {
    return { ok: false, message: "Confira os campos do pagamento." };
  }
  try {
    await createSubscriptionPayment(companyId, toPaymentInput(values));
    refreshScreens();
    return { ok: true };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function removePaymentAction(
  companyId: string,
  paymentId: string,
): Promise<PaymentActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId) || !isUuid(paymentId)) {
    return { ok: false, message: "Pagamento inválido." };
  }
  try {
    await removeSubscriptionPayment(companyId, paymentId);
    refreshScreens();
    return { ok: true };
  } catch (error) {
    return failureFrom(error);
  }
}
