"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/layout/Access";

type ServicesToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
  /** Só o ADMIN define a comissão no formulário. */
  canSetCommission: boolean;
};

/** Busca por nome e botão de novo serviço (que abre o dialog de cadastro). */
export function ServicesToolbar({
  search,
  canSetCommission,
}: ServicesToolbarProps) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath="/servicos"
        search={search}
        label="Buscar serviço por nome"
      />

      <Can feature="services" action="create">
        <Button
          className="w-full sm:ml-auto sm:w-auto"
          onClick={() => setCreating(true)}
        >
          <Plus aria-hidden="true" />
          Novo serviço
        </Button>
      </Can>

      <ServiceFormDialog
        open={creating}
        onOpenChange={setCreating}
        canSetCommission={canSetCommission}
      />
    </div>
  );
}
