"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { getCurrentUser } from "@/services/auth.service";
import {
  cancelClientPlan,
  createClientPlan,
  getClientPlan,
} from "@/services/client-plan.service";
import { listClientPlanPayments } from "@/services/payment.service";
import type { ClientPlanItem, NewClientPlanInput } from "@/types/client-plan";
import type { PaymentItem } from "@/types/payment";
import { isDateString, toDateString } from "@/utils/time";

export type ClientPlanSummaryResult =
  { ok: true; item: ClientPlanItem; payments: PaymentItem[] } | ActionFailure;

/** Contratação e parcelas, para o diálogo aberto pela agenda. */
export async function getClientPlanSummaryAction(
  id: string,
): Promise<ClientPlanSummaryResult> {
  try {
    const [item, payments] = await Promise.all([
      getClientPlan(id),
      listClientPlanPayments(id),
    ]);
    return { ok: true, item, payments };
  } catch (error) {
    return failureFrom(error);
  }
}

export type CreateClientPlanResult = { ok: true; id: string } | ActionFailure;
export type ClientPlanActionResult = { ok: true } | ActionFailure;

/**
 * Contrata o plano: contratação, agendas e pagamentos de uma vez (tudo ou nada).
 * As regras de valor, frequência e conflito são do servidor; aqui só o básico.
 */
export async function createClientPlanAction(
  input: NewClientPlanInput,
): Promise<CreateClientPlanResult> {
  try {
    const { company } = await getCurrentUser();
    const today = toDateString(new Date(), company.timezone);

    if (!isDateString(input.startDate) || input.startDate < today) {
      return {
        ok: false,
        message: "A data de início deve ser hoje ou uma data futura.",
      };
    }
    if (input.billingType === "MONTHLY" && !input.firstDueDate) {
      return {
        ok: false,
        message: "Informe o primeiro vencimento (obrigatório no mensal).",
      };
    }

    const created = await createClientPlan(input);
    revalidatePath("/pacotes/contratacoes");
    revalidatePath("/recorrencias");
    revalidatePath("/");
    return { ok: true, id: created.id };
  } catch (error) {
    return failureFrom(error);
  }
}

export async function cancelClientPlanAction(
  id: string,
): Promise<ClientPlanActionResult> {
  try {
    await cancelClientPlan(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/pacotes/contratacoes");
  revalidatePath(`/pacotes/contratacoes/${id}`);
  revalidatePath("/recorrencias");
  revalidatePath("/");
  return { ok: true };
}
