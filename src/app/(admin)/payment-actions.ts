"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { getCurrentUser } from "@/services/auth.service";
import { settlePayments } from "@/services/payment.service";
import { dayBounds, isDateString, toDateString } from "@/utils/time";

export type SettlePaymentsResult = { ok: true } | ActionFailure<"paidAt">;

// Meio-dia: uma data passada escolhida no calendário não vira o dia anterior
// por causa do fuso.
const HALF_DAY_MS = 12 * 60 * 60 * 1000;

/**
 * Baixa de um ou mais pagamentos do mesmo cliente, com o mesmo método. `paidDate`
 * ("aaaa-mm-dd", opcional) lança uma baixa esquecida; hoje ou vazio = agora.
 */
export async function settlePaymentsAction(input: {
  paymentIds: string[];
  paymentMethodId: string;
  paidDate?: string;
}): Promise<SettlePaymentsResult> {
  if (input.paymentIds.length === 0) {
    return { ok: false, message: "Marque ao menos um pagamento." };
  }
  if (!input.paymentMethodId) {
    return { ok: false, message: "Escolha o método de pagamento." };
  }

  try {
    let paidAt: string | undefined;
    if (input.paidDate) {
      const { company } = await getCurrentUser();
      const today = toDateString(new Date(), company.timezone);
      if (!isDateString(input.paidDate) || input.paidDate > today) {
        return {
          ok: false,
          message: "A data do pagamento não pode ser futura.",
          field: "paidAt",
        };
      }
      if (input.paidDate !== today) {
        paidAt = new Date(
          dayBounds(input.paidDate, company.timezone).from.getTime() +
            HALF_DAY_MS,
        ).toISOString();
      }
    }

    await settlePayments({
      paymentIds: input.paymentIds,
      paymentMethodId: input.paymentMethodId,
      paidAt,
    });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/comandas");
  return { ok: true };
}
