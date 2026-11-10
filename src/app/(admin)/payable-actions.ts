"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import {
  cancelPayable,
  createPayable,
  deletePayable,
  settlePayables,
  updatePayable,
} from "@/services/payable.service";
import type { PayableInput } from "@/types/payable";
import { isDateString } from "@/utils/time";

const PATH = "/financeiro/contas-a-pagar";

type Result = { ok: true } | ActionFailure;

// Confere de novo no servidor o que o diálogo já conferiu (ids e datas).
function invalid(input: Omit<PayableInput, "repeat" | "paid">): string | null {
  if (!input.description.trim()) return "Informe a descrição.";
  if (!isUuid(input.categoryId)) return "Escolha a categoria.";
  if (input.payeeId !== null && !isUuid(input.payeeId)) {
    return "Favorecido inválido.";
  }
  if (!(input.amount > 0)) return "Informe o valor.";
  if (!isDateString(input.dueDate)) return "Informe o vencimento.";
  return null;
}

/** Lança a conta (ou a série); a API confere favorecido, categoria e datas. */
export async function createPayableAction(
  input: PayableInput,
): Promise<Result> {
  const message = invalid(input);
  if (message) return { ok: false, message };
  try {
    await createPayable(input);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Altera só esta conta (pendente). */
export async function updatePayableAction(
  id: string,
  input: Omit<PayableInput, "repeat" | "paid">,
): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Conta inválida." };
  const message = invalid(input);
  if (message) return { ok: false, message };
  try {
    await updatePayable(id, input);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Paga uma ou várias contas pendentes. */
export async function settlePayablesAction(input: {
  ids: string[];
  paidAt: string;
  paymentMethodId: string;
}): Promise<Result> {
  if (input.ids.length === 0 || !input.ids.every(isUuid)) {
    return { ok: false, message: "Escolha ao menos uma conta." };
  }
  if (!isUuid(input.paymentMethodId)) {
    return { ok: false, message: "Escolha o método de pagamento." };
  }
  if (!isDateString(input.paidAt)) {
    return { ok: false, message: "Informe a data do pagamento." };
  }
  try {
    await settlePayables(input);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function cancelPayableAction(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Conta inválida." };
  try {
    await cancelPayable(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deletePayableAction(id: string): Promise<Result> {
  if (!isUuid(id)) return { ok: false, message: "Conta inválida." };
  try {
    await deletePayable(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}
