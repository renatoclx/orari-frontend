"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProductCategoryFormDialog } from "@/components/product-categories/ProductCategoryFormDialog";
import { Can } from "@/components/layout/Access";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = "/produtos/categorias";

type ProductCategoriesToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
  /** Situação na URL (?status=); "all" = sem filtro. */
  status: string;
};

/** Busca por nome, filtro de situação e botão de nova categoria (dialog). */
export function ProductCategoriesToolbar({
  search,
  status,
}: ProductCategoriesToolbarProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // Troca a situação mantendo a busca, e volta para a primeira página.
  function changeStatus(next: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (next !== "all") params.set("status", next);
    const query = params.toString();
    router.push(query ? `${BASE_PATH}?${query}` : BASE_PATH);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath={BASE_PATH}
        search={search}
        label="Buscar categoria de produto por nome"
        query={{ status: status === "all" ? undefined : status }}
      />

      <Select value={status} onValueChange={changeStatus}>
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativas</SelectItem>
          <SelectItem value="inactive">Inativas</SelectItem>
        </SelectContent>
      </Select>

      <Can feature="product-categories" action="create">
        <Button
          className="w-full sm:ml-auto sm:w-auto"
          onClick={() => setCreating(true)}
        >
          <Plus aria-hidden="true" />
          Nova categoria
        </Button>
      </Can>

      <ProductCategoryFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
