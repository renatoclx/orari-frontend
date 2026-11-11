import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  Product,
  ProductInput,
  StockMovement,
  StockMovementInput,
} from "@/types/product";

type ListProductsParams = {
  /** Busca parcial pelo nome ou pelo SKU. */
  search?: string;
  categoryId?: string;
  supplierId?: string;
  /** `true`: só ativos; `false`: só inativos; sem ele, os dois. */
  isActive?: boolean;
  /** `true`: só os com o estoque atual abaixo do mínimo. */
  lowStock?: boolean;
  page: number;
  limit: number;
};

// Em ordem de nome; os excluídos não aparecem.
export function listProducts(
  params: ListProductsParams,
): Promise<Paginated<Product>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const search = params.search?.trim();
  if (search) query.set("search", search);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.supplierId) query.set("supplierId", params.supplierId);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }
  if (params.lowStock) query.set("lowStock", "true");

  return apiFetch<Paginated<Product>>(`/products?${query}`);
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

/** Cadastro; devolve o produto para enviar a foto em seguida. */
export function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Alteração (também inativa e reativa, pelo `isActive`). O estoque atual não
 * vai: muda só pelas movimentações (a API recusa).
 */
export async function updateProduct(
  id: string,
  input: Partial<Omit<ProductInput, "currentStock">> & { isActive?: boolean },
): Promise<void> {
  await apiFetch(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Exclusão lógica: some das listagens e o SKU fica livre. */
export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/products/${id}`, { method: "DELETE" });
}

/** Envia a foto (JPEG ou PNG, até 2 MB); substitui a anterior. */
export async function uploadProductPhoto(
  id: string,
  photo: File,
): Promise<void> {
  const body = new FormData();
  body.append("photo", photo, photo.name);
  await apiFetch(`/products/${id}/photo`, { method: "POST", body });
}

export async function removeProductPhoto(id: string): Promise<void> {
  await apiFetch(`/products/${id}/photo`, { method: "DELETE" });
}

/** Histórico de estoque do produto, da movimentação mais recente para a mais antiga. */
export function listStockMovements(
  productId: string,
  page: number,
  limit: number,
): Promise<Paginated<StockMovement>> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch<Paginated<StockMovement>>(
    `/products/${productId}/stock-movements?${query}`,
  );
}

/** Entrada, saída ou ajuste; a compra pode lançar a conta a pagar junto. */
export function createStockMovement(
  productId: string,
  input: StockMovementInput,
): Promise<StockMovement> {
  return apiFetch<StockMovement>(`/products/${productId}/stock-movements`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
