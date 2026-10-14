"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";

type ServicesToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
};

export function ServicesToolbar({ search }: ServicesToolbarProps) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath="/servicos"
        search={search}
        label="Buscar serviço por nome"
      />

      <Button
        className="w-full sm:ml-auto sm:w-auto"
        onClick={() => setCreating(true)}
      >
        <Plus aria-hidden="true" />
        Novo serviço
      </Button>

      <ServiceFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
