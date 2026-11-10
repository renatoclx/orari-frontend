"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ExpenseCategoryFormDialog } from "@/components/expense-categories/ExpenseCategoryFormDialog";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/layout/Access";

/** Busca por nome e botão de nova categoria (que abre o dialog de cadastro). */
export function ExpenseCategoriesToolbar({ search }: { search: string }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath="/financeiro/categorias-de-despesa"
        search={search}
        label="Buscar categoria de despesa por nome"
      />

      <Can feature="expense-categories" action="create">
        <Button
          className="w-full sm:ml-auto sm:w-auto"
          onClick={() => setCreating(true)}
        >
          <Plus aria-hidden="true" />
          Nova categoria
        </Button>
      </Can>

      <ExpenseCategoryFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
