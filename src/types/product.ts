// Espelha as respostas de /product-categories e /products do backend
// (docs/business-rules/categorias-produtos.md).

export type ProductCategory = {
  id: string;
  /** Único na empresa, sem diferenciar acentos nem maiúsculas. */
  name: string;
  /** Não há exclusão: a categoria é inativada e reativada. */
  isActive: boolean;
};

/** Unidades de medida aceitas pela API (lista fixa). */
export type ProductUnit = "UN" | "CX" | "PCT" | "KG" | "G" | "L" | "ML" | "M";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  categoryId: string;
  supplierId: string | null;
  measureUnit: ProductUnit | null;
  // Decimais chegam como texto (ex.: "100", "37.5"), como no resto da API.
  salePrice: string;
  purchasePrice: string;
  promotionalPrice: string | null;
  /** Calculada pela API sobre a venda; pode ser negativa. */
  profitMargin: string;
  currentStock: number;
  minimalStock: number | null;
  maximumStock: number | null;
  photoUrl: string | null;
  isActive: boolean;
  category: { id: string; name: string };
  supplier: { id: string; name: string } | null;
};

/**
 * Corpo do cadastro. Na alteração tudo é opcional, e `null` limpa os campos
 * opcionais. `profitMargin` nunca vai: a API recusa (400).
 */
export type ProductInput = {
  name: string;
  description: string | null;
  sku: string | null;
  categoryId: string;
  supplierId: string | null;
  measureUnit: ProductUnit | null;
  salePrice: number;
  purchasePrice: number;
  promotionalPrice: number | null;
  currentStock: number;
  minimalStock: number | null;
  maximumStock: number | null;
};
