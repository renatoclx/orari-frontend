// Filtros da listagem de produtos (na URL), comuns ao servidor e à barra.

export const PRODUCTS_PATH = "/produtos";

/** Valor "todos" dos selects. */
export const ALL = "all";

export type ProductFiltersState = {
  /** Nome ou SKU (?q=). */
  search: string;
  /** Id da categoria (?categoria=) ou ALL. */
  category: string;
  /** Id do fornecedor (?fornecedor=) ou ALL. */
  supplier: string;
  /** Situação (?status=): "active", "inactive" ou ALL. */
  status: string;
  /** Estoque (?estoque=baixo): "low" ou ALL. */
  stock: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value.trim() : "";

/** Lê a URL; valor inválido vira o padrão (a API recusaria um id malformado). */
export function readProductFilters(
  searchParams: SearchParams,
): ProductFiltersState {
  const uuid = (value: string) =>
    /^[0-9a-f-]{36}$/i.test(value) ? value : ALL;
  const status = text(searchParams.status);
  return {
    search: text(searchParams.q),
    category: uuid(text(searchParams.categoria)),
    supplier: uuid(text(searchParams.fornecedor)),
    status: status === "active" || status === "inactive" ? status : ALL,
    stock: text(searchParams.estoque) === "baixo" ? "low" : ALL,
  };
}

/** Query string só com o que não é o padrão (sem a página: volta à primeira). */
export function productQuery(
  filters: ProductFiltersState,
  overrides: Partial<ProductFiltersState> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.search) query.set("q", next.search);
  if (next.category !== ALL) query.set("categoria", next.category);
  if (next.supplier !== ALL) query.set("fornecedor", next.supplier);
  if (next.status !== ALL) query.set("status", next.status);
  if (next.stock !== ALL) query.set("estoque", "baixo");
  return query;
}

/** O que a API recebe. */
export function productApiFilters(filters: ProductFiltersState) {
  return {
    search: filters.search || undefined,
    categoryId: filters.category === ALL ? undefined : filters.category,
    supplierId: filters.supplier === ALL ? undefined : filters.supplier,
    isActive: filters.status === ALL ? undefined : filters.status === "active",
    lowStock: filters.stock === "low" || undefined,
  };
}
