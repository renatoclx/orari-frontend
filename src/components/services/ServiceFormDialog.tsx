"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createServiceAction,
  updateServiceAction,
} from "@/app/(admin)/service-actions";
import {
  serviceFieldOrder,
  validateServiceForm,
  type ServiceFormErrors,
} from "@/components/services/service-validation";
import { ColorField } from "@/components/shared/ColorField";
import { FormField } from "@/components/shared/FormField";
import { MaskedInput } from "@/components/shared/MaskedInput";
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
import { Textarea } from "@/components/ui/textarea";
import type { ServiceItem } from "@/types/service";
import { maskCurrency, maskMinutes } from "@/utils/masks";

type ServiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente na alteração; sem isso, é o cadastro. */
  service?: ServiceItem;
};

// "50.00" (reais, texto da API) → "5000" (centavos, o que a máscara guarda).
function priceToCents(price: string | null): string {
  return price ? String(Math.round(Number(price) * 100)) : "";
}

// Ids dos campos validados: ligam o erro de cada campo ao elemento que recebe o foco.
const FIELD_IDS = {
  name: "service-name",
  duration: "service-duration",
  price: "service-price",
} as const;

// Dialog de formulário (screen-patterns.md) de cadastro e alteração de serviço.
// O conteúdo só existe com o dialog aberto, então os campos começam limpos (ou
// com os dados do serviço) a cada abertura.
export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <ServiceForm service={service} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

// Formulário em si; separado do Dialog para o estado começar limpo a cada abertura.
function ServiceForm({
  service,
  onClose,
}: {
  service?: ServiceItem;
  onClose: () => void;
}) {
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [pending, startTransition] = useTransition();
  const editing = service !== undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();

    const found = validateServiceForm({
      name,
      duration: String(data.get("duration") ?? ""),
      price: String(data.get("price") ?? ""),
    });
    setErrors(found);

    const firstInvalid = serviceFieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    startTransition(async () => {
      const result = service
        ? await updateServiceAction(service.id, data)
        : await createServiceAction(data);

      if (result.ok) {
        toast.success(editing ? "Serviço atualizado." : "Serviço cadastrado.", {
          description: name,
        });
        onClose();
        return;
      }

      if (result.field) {
        const field = result.field;
        setErrors({ [field]: result.message });
        document.getElementById(FIELD_IDS[field])?.focus();
      }
      toast.error(
        editing
          ? "Não foi possível atualizar o serviço."
          : "Não foi possível cadastrar o serviço.",
        { description: result.message },
      );
    });
  }

  // Corrigir um campo limpa o erro dele.
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const id = (event.target as HTMLElement).id;
    const field = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]).find(
      (key) => FIELD_IDS[key] === id,
    );
    if (field && errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onChange={handleChange}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>
          {editing ? "Alterar serviço" : "Novo serviço"}
        </DialogTitle>
        <DialogDescription>
          {editing
            ? `Atualize os dados de ${service.name}.`
            : "Preencha os dados para adicionar um serviço à sua empresa."}
        </DialogDescription>
      </DialogHeader>

      <FormField id={FIELD_IDS.name} label="Nome" required error={errors.name}>
        <Input
          id={FIELD_IDS.name}
          name="name"
          defaultValue={service?.name}
          autoComplete="off"
          placeholder="Ex.: Corte de cabelo"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${FIELD_IDS.name}-error` : undefined}
          autoFocus
        />
      </FormField>

      <FormField id="service-description" label="Descrição">
        <Textarea
          id="service-description"
          name="description"
          defaultValue={service?.description ?? ""}
          rows={3}
          placeholder="O que está incluído no serviço"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id={FIELD_IDS.duration}
          label="Duração (minutos)"
          required
          error={errors.duration}
        >
          <MaskedInput
            id={FIELD_IDS.duration}
            name="duration"
            mask={maskMinutes}
            initialValue={service ? String(service.duration) : ""}
            inputMode="numeric"
            placeholder="60"
            aria-invalid={errors.duration ? true : undefined}
            aria-describedby={
              errors.duration ? `${FIELD_IDS.duration}-error` : undefined
            }
          />
        </FormField>

        <FormField id={FIELD_IDS.price} label="Preço" error={errors.price}>
          <MaskedInput
            id={FIELD_IDS.price}
            name="price"
            mask={maskCurrency}
            initialValue={priceToCents(service?.price ?? null)}
            inputMode="numeric"
            placeholder="R$ 0,00"
            aria-invalid={errors.price ? true : undefined}
            aria-describedby={
              errors.price ? `${FIELD_IDS.price}-error` : undefined
            }
          />
        </FormField>
      </div>

      <FormField id="service-color" label="Cor">
        <ColorField
          id="service-color"
          name="color"
          initialValue={service?.color}
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Cadastrando…"
              : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
