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
  createCommissionAdvance,
  deleteCommissionAdvance,
  getAdvanceAvailable,
} from "@/services/commission.service";
import { toDateString } from "@/utils/time";

const PATH = "/financeiro/comissoes";

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

  const note = formText(data, "note").trim();
  try {
    await createCommissionAdvance({
      professionalId: values.professionalId,
      // Centavos → reais.
      amount: Number(values.cents) / 100,
      date: values.date,
      ...(note && { note }),
    });
  } catch (error) {
    // O 400 do disponível vai para o campo do valor.
    const failure = failureFrom<AdvanceField>(error);
    return /disponível/i.test(failure.message)
      ? { ...failure, field: "cents" }
      : failure;
  }
  revalidatePath(PATH);
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
  revalidatePath(PATH);
  return { ok: true };
}
