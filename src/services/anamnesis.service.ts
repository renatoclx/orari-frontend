import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  AnamnesisDetail,
  AnamnesisListItem,
  EntryInput,
} from "@/types/anamnesis";

type ListAnamnesesParams = {
  /** Obrigatório: a API não tem listagem geral de fichas. */
  clientId: string;
  page: number;
  limit: number;
};

/** Fichas de um cliente (uma por modelo). */
export function listAnamneses(
  params: ListAnamnesesParams,
): Promise<Paginated<AnamnesisListItem>> {
  const query = new URLSearchParams({
    clientId: params.clientId,
    page: String(params.page),
    limit: String(params.limit),
  });
  return apiFetch<Paginated<AnamnesisListItem>>(`/anamnesis?${query}`);
}

/** Ficha completa, com as perguntas da versão em que nasceu e todo o histórico. */
export function getAnamnesis(id: string): Promise<AnamnesisDetail> {
  return apiFetch<AnamnesisDetail>(`/anamnesis/${id}`);
}

/**
 * Novo acompanhamento da ficha. Cliente inativo responde 409. Devolve a ficha
 * completa já com o registro novo.
 */
export function createEntry(
  id: string,
  input: EntryInput,
): Promise<AnamnesisDetail> {
  return apiFetch<AnamnesisDetail>(`/anamnesis/${id}/entries`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Máximo de ids por consulta da API (cabem na URL).
const ENTRY_APPOINTMENTS_CHUNK = 100;

/**
 * Dos agendamentos informados, os que já têm acompanhamento. A API devolve só
 * ids (nada do conteúdo da ficha), em consultas de até 100.
 */
export async function findAppointmentsWithEntry(
  appointmentIds: string[],
): Promise<Set<string>> {
  const found = new Set<string>();
  for (let i = 0; i < appointmentIds.length; i += ENTRY_APPOINTMENTS_CHUNK) {
    const chunk = appointmentIds.slice(i, i + ENTRY_APPOINTMENTS_CHUNK);
    const query = new URLSearchParams({ appointmentIds: chunk.join(",") });
    const result = await apiFetch<{ appointmentIds: string[] }>(
      `/anamnesis/appointments-with-entry?${query}`,
    );
    result.appointmentIds.forEach((id) => found.add(id));
  }
  return found;
}
