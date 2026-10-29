"use client";

import { Save, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateClassGroupAction } from "@/app/(admin)/class-group-actions";
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  CLASS_NAME_MAX,
  capacityError,
  classGroupLabel,
  nameError,
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
import type { ClassGroupItem } from "@/types/class-group";

type ClassGroupEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classGroup?: ClassGroupItem;
};

// Alteração da turma: só nome e vagas (a API não aceita mudar serviço,
// profissional ou horários). O conteúdo só existe aberto, então começa com os
// dados da turma a cada abertura.
export function ClassGroupEditDialog({
  open,
  onOpenChange,
  classGroup,
}: ClassGroupEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {classGroup && (
          <EditForm
            classGroup={classGroup}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  classGroup,
  onClose,
}: {
  classGroup: ClassGroupItem;
  onClose: () => void;
}) {
  const [name, setName] = useState(classGroup.name ?? "");
  const [capacity, setCapacity] = useState(String(classGroup.capacity));
  const [errors, setErrors] = useState<{ name?: string; capacity?: string }>(
    {},
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = { name: nameError(name), capacity: capacityError(capacity) };
    setErrors(found);
    if (found.name || found.capacity) {
      document
        .getElementById(
          found.name ? "class-group-edit-name" : "class-group-edit-capacity",
        )
        ?.focus();
      return;
    }

    startTransition(async () => {
      const result = await updateClassGroupAction(classGroup.id, {
        name,
        capacity,
      });
      if (result.ok) {
        toast.success("Turma atualizada.", {
          description: name.trim() || classGroup.service.name,
        });
        onClose();
        return;
      }
      // Ex.: vagas abaixo dos alunos já encaixados numa sessão futura.
      toast.error("Não foi possível atualizar a turma.", {
        description: result.message,
      });
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Alterar turma</DialogTitle>
        <DialogDescription>
          Atualize o nome e as vagas de {classGroupLabel(classGroup)}. Serviço,
          profissional e horários não mudam: para mudá-los, inative a turma e
          cadastre outra.
        </DialogDescription>
      </DialogHeader>

      <FormField id="class-group-edit-name" label="Nome" error={errors.name}>
        <Input
          id="class-group-edit-name"
          value={name}
          maxLength={CLASS_NAME_MAX}
          autoComplete="off"
          placeholder="Ex.: Pilates manhã"
          aria-invalid={errors.name ? true : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          autoFocus
        />
      </FormField>

      <FormField
        id="class-group-edit-capacity"
        label="Vagas por sessão"
        required
        error={errors.capacity}
      >
        <Input
          id="class-group-edit-capacity"
          type="number"
          inputMode="numeric"
          min={CAPACITY_MIN}
          max={CAPACITY_MAX}
          value={capacity}
          aria-invalid={errors.capacity ? true : undefined}
          onChange={(event) => {
            setCapacity(event.target.value.replace(/\D/g, ""));
            setErrors((current) => ({ ...current, capacity: undefined }));
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
          <Save aria-hidden="true" />
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </form>
  );
}
