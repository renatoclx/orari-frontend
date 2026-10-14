import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/location";
import type { PeopleType, PersonListItem } from "@/types/people";

type ListPeopleParams = {
  type: PeopleType;
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  page: number;
  limit: number;
};

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

  return apiFetch<Paginated<PersonListItem>>(`/people?${query}`);
}

/** Exclusão lógica: a pessoa fica inativa (`deletedAt`) e o histórico é preservado. */
export function deletePerson(id: string): Promise<void> {
  return apiFetch<void>(`/people/${id}`, { method: "DELETE" });
}
