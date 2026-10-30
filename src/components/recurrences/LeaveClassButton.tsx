"use client";

import { LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { leaveClassGroupAction } from "@/app/(admin)/recurrence-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
type LeaveClassButtonProps = {
  recurrenceId: string;
  clientName: string;
  /** Agenda de plano: continua ativa e as aulas ficam para reposição. */
  isPackage: boolean;
  /** Chamado depois da saída (ex.: buscar as sessões de novo). */
  onLeft?: () => void;
};

/**
 * "Sair da turma": o aluno da recorrência (avulsa ou de plano) deixa a turma
 * fixa, com o motivo opcional. As aulas futuras na turma são canceladas.
 */
export function LeaveClassButton({
  recurrenceId,
  clientName,
  isPackage,
  onLeft,
}: LeaveClassButtonProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function leave() {
    startTransition(async () => {
      const result = await leaveClassGroupAction(recurrenceId, note);
      if (result.ok) {
        toast.success("Saída da turma registrada.", {
          description: clientName,
        });
        setOpen(false);
        onLeft?.();
        return;
      }
      toast.error("Não foi possível registrar a saída.", {
        description: result.message,
      });
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <LogOut aria-hidden="true" />
        Sair da turma
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Sair da turma?"
        description={
          isPackage
            ? `As aulas futuras de ${clientName} na turma serão canceladas e ficarão para reposição. O plano continua.`
            : `As aulas futuras de ${clientName} serão canceladas, com os pagamentos pendentes, e a recorrência será encerrada.`
        }
        confirmLabel="Sair da turma"
        pendingLabel="Salvando…"
        cancelLabel="Voltar"
        icon={LogOut}
        destructive
        pending={pending}
        onConfirm={leave}
      >
        <FormField id="leave-class-note" label="Motivo (opcional)">
          <Textarea
            id="leave-class-note"
            value={note}
            maxLength={500}
            placeholder="Ex.: mudou de horário, encerrou o tratamento"
            onChange={(event) => setNote(event.target.value)}
          />
        </FormField>
      </ConfirmDialog>
    </>
  );
}
