"use server";

import { revalidatePath } from "next/cache";
import { autoMessagesHaveErrors } from "@/components/auto-messages/auto-messages";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { saveAutoMessages } from "@/services/auto-message.service";
import type { AutoMessage } from "@/types/auto-message";

/**
 * Grava as mensagens automáticas (screens/mensagens.md). Confere de novo o que
 * o formulário já conferiu: o navegador pode ser burlado.
 */
export async function saveAutoMessagesAction(
  items: AutoMessage[],
): Promise<{ ok: true } | ActionFailure> {
  if (autoMessagesHaveErrors(items)) {
    return { ok: false, message: "Corrija os campos destacados." };
  }
  try {
    await saveAutoMessages(items);
  } catch (error) {
    return failureFrom(error);
  }
  // Cada grupo de mensagens tem a sua página.
  revalidatePath("/mensagens", "layout");
  return { ok: true };
}
