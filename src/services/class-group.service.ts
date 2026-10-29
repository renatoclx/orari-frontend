import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  ClassGroupInput,
  ClassGroupItem,
  ClassGroupUpdate,
} from "@/types/class-group";

type ListClassGroupsParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  /** Sem ele, vêm ativas e inativas. */
  isActive?: boolean;
  page: number;
  limit: number;
};

// Turmas da empresa, da mais recente para a mais antiga (só ADMIN).
export function listClassGroups(
  params: ListClassGroupsParams,
): Promise<Paginated<ClassGroupItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));

  return apiFetch<Paginated<ClassGroupItem>>(`/class-groups?${query}`);
}

/**
 * Cadastra a turma. A API confere o serviço (ativo, aceita turma), o
 * profissional, o funcionamento e a sobreposição dos horários.
 */
export function createClassGroup(
  input: ClassGroupInput,
): Promise<ClassGroupItem> {
  return apiFetch<ClassGroupItem>("/class-groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Altera nome, vagas ou situação; reativar confere de novo os horários. */
export function updateClassGroup(
  id: string,
  input: ClassGroupUpdate,
): Promise<ClassGroupItem> {
  return apiFetch<ClassGroupItem>(`/class-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
