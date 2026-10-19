"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
} from "@/app/(admin)/payment-method-actions";
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
import type { PaymentMethodItem } from "@/types/payment-method";

type PaymentMethodFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente na alteração; sem isso, é o cadastro. */
  method?: PaymentMethodItem;
};

/** Cadastro e alteração de método de pagamento em dialog (screens/metodos-pagamento.md). */
export function PaymentMethodFormDialog(props: PaymentMethodFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* O conteúdo só existe aberto: o campo começa limpo a cada vez. */}
        <PaymentMethodForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function PaymentMethodForm({
  onOpenChange,
  method,
}: PaymentMethodFormDialogProps) {
  const editing = method !== undefined;
  const [name, setName] = useState(method?.name ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Informe o tipo de pagamento.");
      document.getElementById("payment-method-name")?.focus();
      return;
    }

    startTransition(async () => {
      const result = method
        ? await updatePaymentMethodAction(method.id, name)
        : await createPaymentMethodAction(name);
      if (result.ok) {
        toast.success(
          editing
            ? "Método de pagamento atualizado."
            : "Método de pagamento cadastrado.",
          { description: name.trim() },
        );
        onOpenChange(false);
        return;
      }
      if (result.field) setError(result.message);
      toast.error(
        editing
          ? "Não foi possível atualizar o método de pagamento."
          : "Não foi possível cadastrar o método de pagamento.",
        { description: result.message },
      );
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing ? "Alterar método de pagamento" : "Novo método de pagamento"}
        </DialogTitle>
        <DialogDescription>
          Forma como o cliente paga (ex.: Pix, cartão de crédito, dinheiro).
        </DialogDescription>
      </DialogHeader>

      <FormField
        id="payment-method-name"
        label="Tipo de pagamento"
        required
        error={error}
      >
        <Input
          id="payment-method-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(undefined);
          }}
          autoComplete="off"
          placeholder="Ex.: Pix"
          aria-invalid={error ? true : undefined}
          autoFocus
        />
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
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
