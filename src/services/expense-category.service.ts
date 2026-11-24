import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { ExpenseCategoryItem } from "@/types/expense-category";

type ListExpenseCategoriesParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  /** `true`: só as ativas (ex.: lançar conta a pagar). Sem ele, ativas e inativas. */
  isActive?: boolean;
  page: number;
  limit: number;
};

// Ativos e inativos (status pelo deletedAt), em ordem alfabética.
export function listExpenseCategories(
  params: ListExpenseCategoriesParams,
): Promise<Paginated<ExpenseCategoryItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  return apiFetch<Paginated<ExpenseCategoryItem>>(
    `/expense-categories?${query}`,
  );
}

/** Cadastro; nome repetido entre os ativos responde 409. */
export async function createExpenseCategory(name: string): Promise<void> {
  await apiFetch("/expense-categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateExpenseCategory(
  id: string,
  name: string,
): Promise<void> {
  await apiFetch(`/expense-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

/** Inativação (exclusão lógica: preenche o deletedAt). */
export async function deleteExpenseCategory(id: string): Promise<void> {
  await apiFetch(`/expense-categories/${id}`, { method: "DELETE" });
}

/** Reativação: limpa o deletedAt (409 se o nome já estiver com outro ativo). */
export async function restoreExpenseCategory(id: string): Promise<void> {
  await apiFetch(`/expense-categories/${id}/restore`, { method: "PATCH" });
}
