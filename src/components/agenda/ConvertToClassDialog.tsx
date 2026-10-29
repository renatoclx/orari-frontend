"use client";

import { UsersRound, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createClassSessionAction } from "@/app/(admin)/class-session-actions";
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  capacityError,
} from "@/components/class-groups/class-group-rules";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AgendaAppointment } from "@/types/agenda";
import type { ClassSessionItem } from "@/types/class-group";

type ConvertToClassDialogProps = {
  /** Agendamento que vira turma; nulo com o diálogo fechado. */
  appointment: AgendaAppointment | null;
  onClose: () => void;
  /** A sessão criada (para abrir o diálogo da turma em seguida). */
  onConverted: (
    appointment: AgendaAppointment,
    session: ClassSessionItem,
  ) => void;
};

/**
 * Agendamento que vira turma: pede as vagas (contando o cliente dele) e cria a
 * sessão avulsa, com o horário, o serviço e o profissional do agendamento.
 */
export function ConvertToClassDialog({
  appointment,
  onClose,
  onConverted,
}: ConvertToClassDialogProps) {
  return (
    <Dialog
      open={appointment !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        {appointment && (
          <ConvertForm
            key={appointment.id}
            appointment={appointment}
            onClose={onClose}
            onConverted={onConverted}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConvertForm({
  appointment,
  onClose,
  onConverted,
}: {
  appointment: AgendaAppointment;
  onClose: () => void;
  onConverted: ConvertToClassDialogProps["onConverted"];
}) {
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = capacityError(capacity);
    setError(message);
    if (message) {
      document.getElementById("convert-capacity")?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createClassSessionAction(
        appointment.id,
        Number(capacity),
      );
      if (result.ok) {
        toast.success("Atendimento transformado em turma.", {
          description: `${appointment.serviceName}, ${appointment.start} às ${appointment.end}`,
        });
        onConverted(appointment, result.session);
        return;
      }
      toast.error("Não foi possível transformar em turma.", {
        description: result.message,
      });
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Transformar em turma</DialogTitle>
        <DialogDescription>
          O atendimento de {appointment.clientName}, das {appointment.start} às{" "}
          {appointment.end}, passa a receber outros clientes, com o mesmo
          serviço e profissional.
        </DialogDescription>
      </DialogHeader>

      <FormField
        id="convert-capacity"
        label="Vagas (contando este cliente)"
        required
        error={error}
      >
        <Input
          id="convert-capacity"
          type="number"
          inputMode="numeric"
          min={CAPACITY_MIN}
          max={CAPACITY_MAX}
          value={capacity}
          placeholder={`De ${CAPACITY_MIN} a ${CAPACITY_MAX}`}
          aria-invalid={error ? true : undefined}
          autoFocus
          onChange={(event) => {
            setCapacity(event.target.value.replace(/\D/g, ""));
            setError(undefined);
          }}
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          <UsersRound aria-hidden="true" />
          {pending ? "Transformando…" : "Transformar em turma"}
        </Button>
      </DialogFooter>
    </form>
  );
}
