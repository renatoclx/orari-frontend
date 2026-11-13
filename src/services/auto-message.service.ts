import "server-only";

import { apiFetch } from "@/services/api";
import type { AutoMessage } from "@/types/auto-message";

// Mensagens automáticas da clínica (backend: /auto-messages; screens/mensagens.md).

export function listAutoMessages(): Promise<AutoMessage[]> {
  return apiFetch<AutoMessage[]>("/auto-messages");
}

/** Grava as situações enviadas e devolve as nove. */
export function saveAutoMessages(items: AutoMessage[]): Promise<AutoMessage[]> {
  return apiFetch<AutoMessage[]>("/auto-messages", {
    method: "PUT",
    body: JSON.stringify({
      // A API só aceita a opção de cada situação; as outras vão de fora.
      items: items.map(
        ({
          kind,
          enabled,
          body,
          reminderOffsets,
          missYouDays,
          summaryHour,
          summaryItems,
        }) => ({
          kind,
          enabled,
          body,
          ...(kind === "REMINDER" && { reminderOffsets }),
          ...(kind === "MISS_YOU" && missYouDays !== null && { missYouDays }),
          // A hora e os itens só existem no resumo do administrador.
          ...(kind === "ADMIN_SUMMARY" && {
            summaryItems,
            ...(summaryHour !== null && { summaryHour }),
          }),
        }),
      ),
    }),
  });
}
