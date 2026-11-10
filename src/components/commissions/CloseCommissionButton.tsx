"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { CloseCommissionDialog } from "@/components/commissions/CloseCommissionDialog";
import { Can } from "@/components/layout/Access";
import { Button } from "@/components/ui/button";

/**
 * Fechar a comissão do profissional escolhido no filtro. Some sem a ação
 * "Edita" da funcionalidade.
 */
export function CloseCommissionButton(props: {
  professional: { id: string; name: string };
  methods: { id: string; name: string }[];
  today: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Can feature="commissions" action="edit">
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <CheckCircle2 aria-hidden="true" />
        Fechar comissão
      </Button>
      <CloseCommissionDialog open={open} onOpenChange={setOpen} {...props} />
    </Can>
  );
}
