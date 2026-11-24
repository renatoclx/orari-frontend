"use client";

import { useRouter } from "next/navigation";
import { TriangleAlert, X } from "lucide-react";
import {
  ALL,
  PRODUCTS_PATH,
  productQuery,
  type ProductFiltersState,
} from "@/components/products/product-filters";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };

/**
 * Busca (nome ou SKU), filtros de categoria, fornecedor e situação e o
 * "Estoque baixo" (na URL). No celular somem categoria e fornecedor.
 */
export function ProductsToolbar({
  filters,
  categories,
  suppliers,
}: {
  filters: ProductFiltersState;
  categories: Option[];
  suppliers: Option[];
}) {
  const router = useRouter();

  // Troca um filtro mantendo os demais, e volta para a primeira página.
  function change(overrides: Partial<ProductFiltersState>) {
    const query = productQuery(filters, overrides).toString();
    router.push(query ? `${PRODUCTS_PATH}?${query}` : PRODUCTS_PATH);
  }

  const hasFilters = productQuery(filters).size > 0;
  // A busca mantém os outros filtros na URL.
  const kept = Object.fromEntries(productQuery(filters, { search: "" }));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath={PRODUCTS_PATH}
        search={filters.search}
        label="Buscar produto por nome ou SKU"
        placeholder="Buscar por nome ou SKU..."
        query={kept}
      />

      <Select
        value={filters.category}
        onValueChange={(category) => change({ category })}
      >
        <SelectTrigger
          className="w-52 max-sm:hidden"
          aria-label="Filtrar por categoria"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.supplier}
        onValueChange={(supplier) => change({ supplier })}
      >
        <SelectTrigger
          className="w-52 max-sm:hidden"
          aria-label="Filtrar por fornecedor"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os fornecedores</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(status) => change({ status })}
      >
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os status</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      {/* Liga e desliga: mais curto que um select de duas opções. */}
      <Button
        variant="outline"
        aria-pressed={filters.stock === "low"}
        className="aria-pressed:border-destructive aria-pressed:bg-destructive/5 aria-pressed:text-destructive max-sm:w-full dark:aria-pressed:text-red-400"
        onClick={() => change({ stock: filters.stock === "low" ? ALL : "low" })}
      >
        <TriangleAlert aria-hidden="true" />
        Estoque baixo
      </Button>

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(PRODUCTS_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
