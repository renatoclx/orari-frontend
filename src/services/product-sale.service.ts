import "server-only";

import { apiFetch } from "@/services/api";
import type { ProductSaleInput, SaleProduct } from "@/types/product";

/** Produtos ativos para vender (nome ou SKU), até 20, com preço e estoque. */
export function searchSaleProducts(search: string): Promise<SaleProduct[]> {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());
  return apiFetch<SaleProduct[]>(`/product-sales/products?${query}`);
}

/** Venda na comanda: tira os produtos do estoque e cria o pagamento pendente. */
export async function createProductSale(
  input: ProductSaleInput,
): Promise<void> {
  await apiFetch("/product-sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Cancela a venda pendente: o pagamento é cancelado e o estoque volta. */
export async function cancelProductSale(id: string): Promise<void> {
  await apiFetch(`/product-sales/${id}/cancel`, { method: "PATCH" });
}
