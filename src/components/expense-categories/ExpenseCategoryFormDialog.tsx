"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  createExpenseCategoryAction,
  updateExpenseCategoryAction,
} from "@/app/(admin)/expense-category-actions";
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
import type { ExpenseCategoryItem } from "@/types/expense-category";

type ExpenseCategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente na alteração; sem isso, é o cadastro. */
  category?: ExpenseCategoryItem;
};

/** Cadastro e alteração de categoria de despesa em dialog (screens/contas-a-pagar.md). */
export function ExpenseCategoryFormDialog(
  props: ExpenseCategoryFormDialogProps,
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* O conteúdo só existe aberto: o campo começa limpo a cada vez. */}
        <ExpenseCategoryForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ExpenseCategoryForm({
  onOpenChange,
  category,
}: ExpenseCategoryFormDialogProps) {
  const editing = category !== undefined;
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      document.getElementById("expense-category-name")?.focus();
      return;
    }

    startTransition(async () => {
      const result = category
        ? await updateExpenseCategoryAction(category.id, name)
        : await createExpenseCategoryAction(name);
      if (result.ok) {
        toast.success(
          editing
            ? "Categoria de despesa atualizada."
            : "Categoria de despesa cadastrada.",
          { description: name.trim() },
        );
        onOpenChange(false);
        return;
      }
      if (result.field) setError(result.message);
      toast.error(
        editing
          ? "Não foi possível atualizar a categoria de despesa."
          : "Não foi possível cadastrar a categoria de despesa.",
        { description: result.message },
      );
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing
            ? "Alterar categoria de despesa"
            : "Nova categoria de despesa"}
        </DialogTitle>
        <DialogDescription>
          Como a despesa é agrupada nas contas a pagar (ex.: Aluguel, Energia,
          Produtos).
        </DialogDescription>
      </DialogHeader>

      <FormField id="expense-category-name" label="Nome" required error={error}>
        <Input
          id="expense-category-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(undefined);
          }}
          autoComplete="off"
          placeholder="Ex.: Aluguel"
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
