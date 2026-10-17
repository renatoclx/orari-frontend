"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import {
  createBusinessHours,
  deleteBusinessHour,
  listAllBusinessHours,
  updateBusinessHour,
} from "@/services/business-hour.service";
import {
  validateBusinessHours,
  type BusinessHourDraft,
} from "@/components/settings/business-hours-validation";

export type SaveBusinessHoursResult = { ok: true } | ActionFailure;

/**
 * Grava a semana como a tela a deixou: compara com o que está na API e exclui,
 * altera e cria só o necessário. Exclui primeiro, para uma janela movida não
 * colidir com a que sai.
 */
export async function saveBusinessHoursAction(
  drafts: BusinessHourDraft[],
): Promise<SaveBusinessHoursResult> {
  if (Object.keys(validateBusinessHours(drafts)).length > 0) {
    return { ok: false, message: "Corrija os horários destacados." };
  }

  try {
    const current = await listAllBusinessHours();
    const kept = new Set(drafts.flatMap((draft) => draft.id ?? []));

    for (const hour of current) {
      if (!kept.has(hour.id)) await deleteBusinessHour(hour.id);
    }

    for (const draft of drafts) {
      const before = draft.id && current.find((hour) => hour.id === draft.id);
      if (
        before &&
        (before.openAt !== draft.openAt || before.closeAt !== draft.closeAt)
      ) {
        await updateBusinessHour(before.id, {
          weekDay: draft.weekDay,
          openAt: draft.openAt,
          closeAt: draft.closeAt,
        });
      }
    }

    const created = drafts.filter((draft) => !draft.id);
    if (created.length > 0) {
      await createBusinessHours(
        created.map(({ weekDay, openAt, closeAt }) => ({
          weekDay,
          openAt,
          closeAt,
        })),
      );
    }
  } catch (error) {
    return failureFrom(error);
  } finally {
    // Mesmo numa falha no meio, a tela volta a mostrar o que ficou gravado.
    revalidatePath("/configuracoes");
    revalidatePath("/");
  }

  return { ok: true };
}
