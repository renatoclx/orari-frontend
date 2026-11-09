import "server-only";

import { apiFetch } from "@/services/api";
import type { AgendaBlock, AgendaBlockInput } from "@/types/agenda-block";

// Bloqueio de horários da agenda (backend: /agenda-blocks; screens/agendamentos.md).

/** Bloqueios do período (dias da empresa); sem `from`, de hoje em diante. */
export function listAgendaBlocks(
  period: { from?: string; to?: string } = {},
): Promise<AgendaBlock[]> {
  const query = new URLSearchParams(
    Object.entries(period).filter(([, value]) => Boolean(value)),
  ).toString();
  return apiFetch<AgendaBlock[]>(`/agenda-blocks${query ? `?${query}` : ""}`);
}

/**
 * Bloqueia. Com agendamentos no horário, a API recusa (409, code
 * AGENDA_BLOCK_HAS_APPOINTMENTS) até vir `confirmed`.
 */
export function createAgendaBlock(
  data: AgendaBlockInput & { confirmed?: boolean },
): Promise<AgendaBlock & { appointments: number }> {
  return apiFetch("/agenda-blocks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteAgendaBlock(id: string): Promise<void> {
  return apiFetch<void>(`/agenda-blocks/${id}`, { method: "DELETE" });
}
