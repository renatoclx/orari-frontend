"use server";

import { revalidatePath } from "next/cache";
import {
  daysAheadError,
  segmentError,
} from "@/components/client-portal/portal-settings";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { savePortalSettings } from "@/services/portal-settings.service";
import type { PortalSettings } from "@/types/portal";

/**
 * Grava as regras do portal do cliente (screens/portal-do-cliente.md). Confere
 * de novo o que o formulário já conferiu: o navegador pode ser burlado.
 */
export async function savePortalSettingsAction(
  settings: PortalSettings,
): Promise<{ ok: true } | ActionFailure> {
  if (daysAheadError(String(settings.maxDaysAhead)) || segmentError(settings)) {
    return { ok: false, message: "Corrija os campos destacados." };
  }
  try {
    await savePortalSettings(settings);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/portal-do-cliente");
  return { ok: true };
}
