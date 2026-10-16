"use client";

import { Hint } from "@/components/shared/Hint";
import { useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";

// Atalho de cadastro rápido de serviço (screens/layout.md, "Barra de ações lateral"):
// abre o mesmo dialog de cadastro da tela de Serviços, de qualquer tela. Usado
// na barra lateral e no header do celular.
export function QuickServiceShortcut() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Hint label="Cadastrar um novo serviço" side="left">
        <button
          type="button"
          aria-label="Cadastrar serviço"
          onClick={() => setOpen(true)}
          className="rounded-control p-2 text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <ClipboardPlus className="size-5" aria-hidden="true" />
        </button>
      </Hint>

      <ServiceFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
