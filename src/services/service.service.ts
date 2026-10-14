import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { ServiceInput, ServiceItem } from "@/types/service";

// Traz serviços ativos e inativos: o status vem de `isActive`.
type ListServicesParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  page: number;
  limit: number;
};

// Traz serviços ativos e inativos (o status vem do `isActive`).
export function listServices(
  params: ListServicesParams,
): Promise<Paginated<ServiceItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);

  return apiFetch<Paginated<ServiceItem>>(`/services?${query}`);
}

/** Cadastra o serviço; a duração é obrigatória e o preço, opcional. */
export function createService(input: ServiceInput): Promise<ServiceItem> {
  return apiFetch<ServiceItem>("/services", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Exclusão lógica. A API recusa (409) quando o serviço tem agendamentos,
 * recorrências ou planos vinculados; nesse caso o caminho é inativar.
 */
export async function deleteService(id: string): Promise<void> {
  await apiFetch(`/services/${id}`, { method: "DELETE" });
}

/** Inativa ou ativa o serviço (campo `isActive`). */
export function setServiceActive(
  id: string,
  isActive: boolean,
): Promise<ServiceItem> {
  return apiFetch<ServiceItem>(`/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

/** Alteração; `null` limpa descrição, preço ou cor. */
export function updateService(
  id: string,
  input: ServiceInput,
): Promise<ServiceItem> {
  return apiFetch<ServiceItem>(`/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
