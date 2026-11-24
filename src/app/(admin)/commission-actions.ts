"use server";

import { revalidatePath } from "next/cache";
import {
  validateAdvance,
  type AdvanceField,
} from "@/components/commissions/advance-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { formText } from "@/lib/form-data";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  cancelClosing,
  createClosing,
  createCommissionAdvance,
  deleteCommissionAdvance,
  getAdvanceAvailable,
  getClosingPreview,
} from "@/services/commission.service";
import type { ClosingPreview } from "@/types/commission";
import { isDateString } from "@/utils/time";
import { toDateString } from "@/utils/time";

const PATH = "/financeiro/comissoes";
// Adiantamento e fechamento geram (ou desfazem) contas no Contas a pagar.
const PAYABLES_PATH = "/financeiro/contas-a-pagar";

function revalidateBoth() {
  revalidatePath(PATH);
  revalidatePath(PAYABLES_PATH);
}

export type AdvanceActionResult = { ok: true } | ActionFailure<AdvanceField>;

/** Disponível para adiantar ao profissional (texto com duas casas). */
export async function advanceAvailableAction(
  professionalId: string,
): Promise<{ ok: true; available: string } | ActionFailure> {
  if (!isUuid(professionalId)) {
    return { ok: false, message: "Profissional inválido." };
  }
  try {
    const { available } = await getAdvanceAvailable(professionalId);
    return { ok: true, available };
  } catch (error) {
    return failureFrom(error);
  }
}

/** Lança o adiantamento; a API confere de novo a data e o disponível. */
export async function createAdvanceAction(
  data: FormData,
): Promise<AdvanceActionResult> {
  const { company } = await getCurrentUser();
  const values = {
    professionalId: formText(data, "professionalId"),
    cents: formText(data, "cents"),
    date: formText(data, "date"),
    paymentMethodId: formText(data, "paymentMethodId"),
  };
  const errors = validateAdvance(
    values,
    toDateString(new Date(), company.timezone),
    null,
  );
  const invalid = (Object.keys(errors) as AdvanceField[])[0];
  if (invalid) {
    return { ok: false, field: invalid, message: errors[invalid] ?? "" };
  }
  if (!isUuid(values.professionalId)) {
    return {
      ok: false,
      field: "professionalId",
      message: "Profissional inválido.",
    };
  }
  if (!isUuid(values.paymentMethodId)) {
    return {
      ok: false,
      field: "paymentMethodId",
      message: "Método de pagamento inválido.",
    };
  }

  const note = formText(data, "note").trim();
  try {
    await createCommissionAdvance({
      professionalId: values.professionalId,
      // Centavos → reais.
      amount: Number(values.cents) / 100,
      date: values.date,
      paymentMethodId: values.paymentMethodId,
      ...(note && { note }),
    });
  } catch (error) {
    // O 400 do disponível vai para o campo do valor.
    const failure = failureFrom<AdvanceField>(error);
    return /disponível/i.test(failure.message)
      ? { ...failure, field: "cents" }
      : failure;
  }
  revalidateBoth();
  return { ok: true };
}

/** Exclui um adiantamento lançado errado (antes do fechamento). */
export async function deleteAdvanceAction(
  id: string,
): Promise<{ ok: true } | ActionFailure> {
  if (!isUuid(id)) return { ok: false, message: "Adiantamento inválido." };
  try {
    await deleteCommissionAdvance(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidateBoth();
  return { ok: true };
}

/** Prévia do fechamento (recalculada ao trocar a data de corte). */
export async function closingPreviewAction(
  professionalId: string,
  until: string,
): Promise<{ ok: true; preview: ClosingPreview } | ActionFailure> {
  if (!isUuid(professionalId) || !isDateString(until)) {
    return { ok: false, message: "Escolha o profissional e a data de corte." };
  }
  try {
    return {
      ok: true,
      preview: await getClosingPreview(professionalId, until),
    };
  } catch (error) {
    return failureFrom(error);
  }
}

export type ClosingField = "until" | "paymentMethodId" | "paidAt";

/** Fecha a comissão; devolve o fechamento para abrir o recibo. */
export async function createClosingAction(
  data: FormData,
): Promise<
  { ok: true; id: string; number: number } | ActionFailure<ClosingField>
> {
  const { company } = await getCurrentUser();
  const today = toDateString(new Date(), company.timezone);
  const professionalId = formText(data, "professionalId");
  const until = formText(data, "until");
  const paymentMethodId = formText(data, "paymentMethodId");
  const paidAt = formText(data, "paidAt");
  if (!isUuid(professionalId)) {
    return { ok: false, message: "Profissional inválido." };
  }
  if (!isDateString(until) || until > today) {
    return {
      ok: false,
      field: "until",
      message: "Informe a data de corte, até hoje.",
    };
  }
  if (!isUuid(paymentMethodId)) {
    return {
      ok: false,
      field: "paymentMethodId",
      message: "Escolha o método de pagamento.",
    };
  }
  if (!isDateString(paidAt) || paidAt > today) {
    return {
      ok: false,
      field: "paidAt",
      message: "Informe a data do pagamento, até hoje.",
    };
  }
  try {
    const closing = await createClosing({
      professionalId,
      until,
      paymentMethodId,
      paidAt,
    });
    revalidateBoth();
    return { ok: true, ...closing };
  } catch (error) {
    return failureFrom<ClosingField>(error);
  }
}

/** Desfaz o fechamento (só o último do profissional). */
export async function cancelClosingAction(
  id: string,
): Promise<{ ok: true } | ActionFailure> {
  if (!isUuid(id)) return { ok: false, message: "Fechamento inválido." };
  try {
    await cancelClosing(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidateBoth();
  return { ok: true };
}
