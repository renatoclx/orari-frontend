"use client";

import { useState, useTransition } from "react";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { confirmPortalClientAction } from "@/app/(admin)/portal-access-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

type PortalConfirmButtonProps = {
  personId: string;
  clientName: string;
};

/**
 * "Confirmar cliente" para quem entrou sozinho pelo app (screens/pessoas.md).
 * Pede confirmação porque tira o limite de agendamentos do cliente.
 */
export function PortalConfirmButton({
  personId,
  clientName,
}: PortalConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await confirmPortalClientAction(personId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Cliente confirmado.");
      setOpen(false);
    });
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <UserCheck aria-hidden="true" />
        Confirmar cliente
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirmar cliente"
        description={
          <>
            O cadastro de {clientName} foi feito pelo app, e o telefone ainda
            não foi conferido. Confirme só se você sabe quem é. Depois da
            confirmação, o cliente agenda pelo app sem o limite de 2
            agendamentos futuros.
          </>
        }
        confirmLabel="Confirmar"
        pendingLabel="Confirmando…"
        pending={pending}
        icon={UserCheck}
        onConfirm={confirm}
      />
    </>
  );
}
