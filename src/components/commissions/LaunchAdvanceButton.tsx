"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AdvanceFormDialog } from "@/components/commissions/AdvanceFormDialog";
import { Can } from "@/components/layout/Access";
import { Button } from "@/components/ui/button";

/**
 * Ação principal das Comissões: abre o lançamento de adiantamento. Some sem a
 * ação "Cria" da funcionalidade.
 */
export function LaunchAdvanceButton(props: {
  professionals: { id: string; name: string }[];
  defaultProfessionalId?: string;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Can feature="commissions" action="create">
      <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Lançar adiantamento
      </Button>
      <AdvanceFormDialog open={open} onOpenChange={setOpen} {...props} />
    </Can>
  );
}
