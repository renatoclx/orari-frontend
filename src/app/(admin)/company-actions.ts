"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { ApiError } from "@/services/api";
import {
  createBusinessHours,
  deleteBusinessHour,
  listAllBusinessHours,
  updateBusinessHour,
} from "@/services/business-hour.service";
import {
  removeCompanyLogo,
  updateCompanyName,
  uploadCompanyLogo,
} from "@/services/company.service";
import {
  validateBusinessHours,
  type BusinessHourDraft,
} from "@/components/settings/business-hours-validation";

export type SaveCompanySettingsResult = { ok: true } | ActionFailure;

// Mesmo limite do backend para o nome fantasia.
const MAX_NAME_LENGTH = 100;

/**
 * Grava as configurações da empresa. O formulário envia só o que mudou:
 * `fantasyName`, `logo` (arquivo) ou `removeLogo`, e `hours` (a semana em JSON).
 * Cada parte vai na sua rota, nessa ordem; se uma falhar, as anteriores já
 * valeram e a mensagem diz qual parte falhou.
 */
export async function saveCompanySettingsAction(
  data: FormData,
): Promise<SaveCompanySettingsResult> {
  const name = data.get("fantasyName");
  const logo = data.get("logo");
  const hoursJson = data.get("hours");
  const drafts =
    typeof hoursJson === "string"
      ? (JSON.parse(hoursJson) as BusinessHourDraft[])
      : null;

  if (typeof name === "string" && name.trim().length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      message: `O nome fantasia deve ter até ${MAX_NAME_LENGTH} caracteres.`,
      field: "fantasyName",
    };
  }
  if (drafts && Object.keys(validateBusinessHours(drafts)).length > 0) {
    return { ok: false, message: "Corrija os horários destacados." };
  }

  // Parte em gravação, para dizer qual falhou.
  let step = "";
  try {
    if (typeof name === "string") {
      step = "Nome fantasia";
      await updateCompanyName(name.trim() || null);
    }
    if (logo instanceof File && logo.size > 0) {
      step = "Logo";
      await uploadCompanyLogo(logo);
    } else if (data.get("removeLogo") === "1") {
      step = "Logo";
      await removeCompanyLogo();
    }
    if (drafts) {
      step = "Horários";
      await saveBusinessHours(drafts);
    }
  } catch (error) {
    const failure = failureFrom(error);
    // 413 vem do limite de tamanho do servidor, sem mensagem útil.
    const message =
      error instanceof ApiError && error.status === 413
        ? "A logo deve ter até 2 MB."
        : failure.message;
    return { ok: false, message: `${step}: ${message}` };
  } finally {
    // Mesmo numa falha no meio, a tela (e o header, com nome e logo) volta a
    // mostrar o que ficou gravado.
    revalidatePath("/", "layout");
  }

  return { ok: true };
}

/**
 * Grava a semana como a tela a deixou: compara com o que está na API e exclui,
 * altera e cria só o necessário. Exclui primeiro, para uma janela movida não
 * colidir com a que sai.
 */
async function saveBusinessHours(drafts: BusinessHourDraft[]) {
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
}
