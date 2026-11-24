import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { ProductCategory } from "@/types/product";

type ListProductCategoriesParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  /** `true`: só ativas (ex.: escolher a categoria do produto); sem ele, as duas. */
  isActive?: boolean;
  page: number;
  limit: number;
};

// Em ordem de nome.
export function listProductCategories(
  params: ListProductCategoriesParams,
): Promise<Paginated<ProductCategory>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  return apiFetch<Paginated<ProductCategory>>(`/product-categories?${query}`);
}

/** Cadastro; nome repetido na empresa responde 409. */
export async function createProductCategory(name: string): Promise<void> {
  await apiFetch("/product-categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

/**
 * Renomear, inativar ou reativar (não há exclusão). Inativar com produtos
 * ativos responde 409.
 */
export async function updateProductCategory(
  id: string,
  input: { name?: string; isActive?: boolean },
): Promise<void> {
  await apiFetch(`/product-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
