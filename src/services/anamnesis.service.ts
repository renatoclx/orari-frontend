import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { AnamnesisListItem } from "@/types/anamnesis";

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
