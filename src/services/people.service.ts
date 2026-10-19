import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  CreatePersonInput,
  PeopleType,
  PersonListItem,
  UpdatePersonInput,
} from "@/types/people";

// A API devolve pessoas ativas e inativas; o status vem de `deletedAt`.
type ListPeopleParams = {
  type: PeopleType;
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  /** `true`: só ativas; `false`: só inativas; sem ele, as duas. */
  isActive?: boolean;
  page: number;
  limit: number;
};

/** Pessoas de um tipo, com busca por nome, status e paginação. */
export function listPeople(
  params: ListPeopleParams,
): Promise<Paginated<PersonListItem>> {
  const query = new URLSearchParams({
    type: params.type,
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  return apiFetch<Paginated<PersonListItem>>(`/people?${query}`);
}

/** Exclusão lógica: a pessoa fica inativa (`deletedAt`) e o histórico é preservado. */
export function deletePerson(id: string): Promise<void> {
  return apiFetch<void>(`/people/${id}`, { method: "DELETE" });
}

/** Cadastro: pessoa, contatos e endereços são criados juntos (ou nada é criado). */
export function createPerson(
  input: CreatePersonInput,
): Promise<Pick<PersonListItem, "id" | "name">> {
  return apiFetch<Pick<PersonListItem, "id" | "name">>("/people", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Reativa uma pessoa inativa (limpa o `deletedAt`). */
export async function restorePerson(id: string): Promise<void> {
  await apiFetch(`/people/${id}/restore`, { method: "PATCH" });
}

/** Envia a foto (JPEG ou PNG, até 2 MB); a pessoa precisa já existir. */
export async function uploadPersonPhoto(
  id: string,
  photo: File,
): Promise<void> {
  const body = new FormData();
  body.append("photo", photo, photo.name);
  await apiFetch(`/people/${id}/photo`, { method: "POST", body });
}

/** Detalhe de uma pessoa ativa (inativa responde 404). */
export function getPerson(id: string): Promise<PersonListItem> {
  return apiFetch<PersonListItem>(`/people/${id}`);
}

/** Dados da pessoa; contatos e endereços têm rotas próprias (a API recusa neste corpo). */
export async function updatePerson(
  id: string,
  input: UpdatePersonInput,
): Promise<void> {
  await apiFetch(`/people/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Remove a foto da pessoa. */
export async function removePersonPhoto(id: string): Promise<void> {
  await apiFetch(`/people/${id}/photo`, { method: "DELETE" });
}
