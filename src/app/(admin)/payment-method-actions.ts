"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import {
  createPaymentMethod,
  deletePaymentMethod,
  restorePaymentMethod,
  updatePaymentMethod,
} from "@/services/payment-method.service";

export type PaymentMethodActionResult = { ok: true } | ActionFailure<"name">;

const PATH = "/financeiro/metodos-de-pagamento";

// Único campo: o nome (tipo de pagamento), obrigatório.
function checkName(name: string): PaymentMethodActionResult | null {
  return name.trim()
    ? null
    : { ok: false, message: "Informe o tipo de pagamento.", field: "name" };
}

/** Cadastro: nome repetido (409) vai para o campo. */
export async function createPaymentMethodAction(
  name: string,
): Promise<PaymentMethodActionResult> {
  const invalid = checkName(name);
  if (invalid) return invalid;
  try {
    await createPaymentMethod(name.trim());
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function updatePaymentMethodAction(
  id: string,
  name: string,
): Promise<PaymentMethodActionResult> {
  const invalid = checkName(name);
  if (invalid) return invalid;
  try {
    await updatePaymentMethod(id, name.trim());
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function restorePaymentMethodAction(
  id: string,
): Promise<PaymentMethodActionResult> {
  try {
    await restorePaymentMethod(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deletePaymentMethodAction(
  id: string,
): Promise<PaymentMethodActionResult> {
  try {
    await deletePaymentMethod(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}
