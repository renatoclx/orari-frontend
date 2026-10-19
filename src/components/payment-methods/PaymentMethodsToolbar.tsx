"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PaymentMethodFormDialog } from "@/components/payment-methods/PaymentMethodFormDialog";
import { ListSearch } from "@/components/shared/ListSearch";
import { Button } from "@/components/ui/button";

/** Busca por nome e botão de novo método (que abre o dialog de cadastro). */
export function PaymentMethodsToolbar({ search }: { search: string }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearch
        basePath="/financeiro/metodos-de-pagamento"
        search={search}
        label="Buscar método de pagamento por nome"
      />

      <Button
        className="w-full sm:ml-auto sm:w-auto"
        onClick={() => setCreating(true)}
      >
        <Plus aria-hidden="true" />
        Novo método de pagamento
      </Button>

      <PaymentMethodFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
