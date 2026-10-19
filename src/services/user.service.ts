import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  CreateUserInput,
  UpdatePasswordInput,
  UpdateUserInput,
  UserListItem,
} from "@/types/user";

// A API devolve ativos e inativos (status pelo deletedAt); o ADMIN não vê SUPER_ADMIN.
type ListUsersParams = {
  page: number;
  limit: number;
};

// Usuários da empresa, do mais recente para o mais antigo, com paginação.
export function listUsers(
  params: ListUsersParams,
): Promise<Paginated<UserListItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  return apiFetch<Paginated<UserListItem>>(`/users?${query}`);
}

// Exclusão lógica de um usuário
export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}

// Cadastro de usuário com confirmação de senha
export function createUser(
  input: CreateUserInput,
): Promise<Pick<UserListItem, "id" | "name">> {
  return apiFetch<Pick<UserListItem, "id" | "name">>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Atualizar um usuário
export function updateUser(id: string, update: UpdateUserInput): Promise<void> {
  return apiFetch<void>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

// Exibir detalhes de um usuário
export function getUser(id: string): Promise<UserListItem> {
  return apiFetch<UserListItem>(`/users/${id}`);
}

// Resetar a senha de um usuário
export async function resetUserPassword(
  id: string,
  update: UpdatePasswordInput,
): Promise<void> {
  await apiFetch<void>(`/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

// Reativar um usuário inativado (limpa o deletedAt)
export async function restoreUser(id: string): Promise<void> {
  await apiFetch(`/users/${id}/restore`, { method: "PATCH" });
}
