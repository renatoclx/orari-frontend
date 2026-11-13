import "server-only";

import { apiFetch } from "@/services/api";
import type { AutoMessage } from "@/types/auto-message";

// Mensagens automáticas da clínica (backend: /auto-messages; screens/mensagens.md).

export function listAutoMessages(): Promise<AutoMessage[]> {
  return apiFetch<AutoMessage[]>("/auto-messages");
}

/** Grava as situações enviadas e devolve as oito. */
export function saveAutoMessages(items: AutoMessage[]): Promise<AutoMessage[]> {
  return apiFetch<AutoMessage[]>("/auto-messages", {
    method: "PUT",
    body: JSON.stringify({
      // A API só aceita a opção de cada situação; as outras vão de fora.
      items: items.map(
        ({ kind, enabled, body, reminderOffsets, missYouDays }) => ({
          kind,
          enabled,
          body,
          ...(kind === "REMINDER" && { reminderOffsets }),
          ...(kind === "MISS_YOU" && missYouDays !== null && { missYouDays }),
        }),
      ),
    }),
  });
}
