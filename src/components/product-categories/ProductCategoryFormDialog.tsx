"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  createProductCategoryAction,
  renameProductCategoryAction,
} from "@/app/(admin)/product-category-actions";
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
import type { ProductCategory } from "@/types/product";

type ProductCategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente na alteração; sem isso, é o cadastro. */
  category?: ProductCategory;
};

/** Cadastro e alteração (nome) de categoria de produto em dialog (screens/produtos.md). */
export function ProductCategoryFormDialog(
  props: ProductCategoryFormDialogProps,
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* O conteúdo só existe aberto: o campo começa limpo a cada vez. */}
        <ProductCategoryForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ProductCategoryForm({
  onOpenChange,
  category,
}: ProductCategoryFormDialogProps) {
  const editing = category !== undefined;
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      document.getElementById("product-category-name")?.focus();
      return;
    }

    startTransition(async () => {
      const result = category
        ? await renameProductCategoryAction(category.id, name)
        : await createProductCategoryAction(name);
      if (result.ok) {
        toast.success(
          editing
            ? "Categoria de produto atualizada."
            : "Categoria de produto cadastrada.",
          { description: name.trim() },
        );
        onOpenChange(false);
        return;
      }
      if (result.field) setError(result.message);
      toast.error(
        editing
          ? "Não foi possível atualizar a categoria de produto."
          : "Não foi possível cadastrar a categoria de produto.",
        { description: result.message },
      );
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing
            ? "Alterar categoria de produto"
            : "Nova categoria de produto"}
        </DialogTitle>
        <DialogDescription>
          Como os produtos são agrupados (ex.: Cosméticos, Acessórios).
        </DialogDescription>
      </DialogHeader>

      <FormField id="product-category-name" label="Nome" required error={error}>
        <Input
          id="product-category-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(undefined);
          }}
          autoComplete="off"
          placeholder="Ex.: Cosméticos"
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
