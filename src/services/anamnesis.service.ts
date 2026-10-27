import "server-only";

import { apiFetch, apiFetchBytes } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  AnamnesisClientItem,
  AnamnesisDetail,
  AnamnesisInput,
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

/**
 * Nova ficha (registro inicial). Cliente inativo, modelo inativo ou ficha já
 * existente do cliente para o modelo respondem 409; pergunta obrigatória sem
 * resposta, 400.
 */
export function createAnamnesis(
  input: AnamnesisInput,
): Promise<AnamnesisDetail> {
  return apiFetch<AnamnesisDetail>("/anamnesis", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

type ListAnamnesisClientsParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  page: number;
  limit: number;
};

/**
 * Clientes que têm ficha, com a quantidade (só nome e contagem). Uma consulta
 * para a página inteira: listar as fichas cliente a cliente geraria uma
 * auditoria por cliente.
 */
export function listAnamnesisClients(
  params: ListAnamnesisClientsParams,
): Promise<Paginated<AnamnesisClientItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  return apiFetch<Paginated<AnamnesisClientItem>>(
    `/anamnesis/clients?${query}`,
  );
}

/**
 * PDF da ficha, gerado no backend. Com `includeHistory`, traz também o histórico
 * de acompanhamento (página própria, sem assinatura); sem ele, só a ficha, para
 * a via do cliente.
 */
export function getAnamnesisPdf(id: string, includeHistory: boolean) {
  const query = new URLSearchParams({ includeHistory: String(includeHistory) });
  return apiFetchBytes(`/anamnesis/${id}/pdf?${query}`);
}
