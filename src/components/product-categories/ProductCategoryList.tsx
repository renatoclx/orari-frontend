"use client";

import { useState, useTransition } from "react";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { setProductCategoryActiveAction } from "@/app/(admin)/product-category-actions";
import { useCan } from "@/components/layout/Access";
import { ProductCategoryFormDialog } from "@/components/product-categories/ProductCategoryFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { ProductCategory } from "@/types/product";

type ProductCategoryListProps = {
  categories: ProductCategory[];
  /** Há busca ou filtro: a lista vazia diz que nada foi encontrado. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Coluna Ações: poucas, então ficam à vista. Ativa: Alterar e Inativar.
// Inativa: só Reativar, como nas categorias de despesa.
function Actions({
  category,
  onEdit,
  onDeactivate,
  onRestore,
  busy,
}: {
  category: ProductCategory;
  onEdit: (category: ProductCategory) => void;
  onDeactivate: (category: ProductCategory) => void;
  onRestore: (category: ProductCategory) => void;
  /** Há uma reativação em andamento. */
  busy: boolean;
}) {
  const canEdit = useCan("product-categories", "edit");
  const canRemove = useCan("product-categories", "remove");
  if (!category.isActive) {
    // Reativar é o oposto de inativar: mesma coluna da matriz.
    if (!canRemove) return null;
    return (
      <Hint label={`Reativar ${category.name}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Reativar ${category.name}`}
          disabled={busy}
          onClick={() => onRestore(category)}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </Hint>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1">
      {canEdit && (
        <Hint label={`Alterar ${category.name}`}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Alterar ${category.name}`}
            onClick={() => onEdit(category)}
          >
            <Pencil aria-hidden="true" />
          </Button>
        </Hint>
      )}
      {canRemove && (
        <Hint label={`Inativar ${category.name}`}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Inativar ${category.name}`}
            onClick={() => onDeactivate(category)}
          >
            <Ban aria-hidden="true" />
          </Button>
        </Hint>
      )}
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function ProductCategoryList({
  categories,
  filtered,
  footer,
}: ProductCategoryListProps) {
  // A categoria fica guardada ao fechar, para o dialog não trocar de título
  // durante a animação de saída.
  const [editing, setEditing] = useState<ProductCategory>();
  const [editOpen, setEditOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<ProductCategory | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();

  function restore(category: ProductCategory) {
    startRestore(async () => {
      const result = await setProductCategoryActiveAction(category.id, true);
      if (result.ok) {
        toast.success("Categoria de produto reativada.", {
          description: category.name,
        });
      } else {
        toast.error("Não foi possível reativar a categoria de produto.", {
          description: result.message,
        });
      }
    });
  }

  function edit(category: ProductCategory) {
    setEditing(category);
    setEditOpen(true);
  }

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await setProductCategoryActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Categoria de produto inativada.", {
          description: target.name,
        });
        setDeactivating(null);
      } else {
        // Ex.: a categoria ainda tem produtos ativos (409).
        toast.error("Não foi possível inativar a categoria de produto.", {
          description: result.message,
        });
      }
    });
  }

  return (
    <ListCard
      columns={["Nome", "Status", "Ações"]}
      emptyMessage={
        categories.length === 0
          ? filtered
            ? "Nenhuma categoria de produto encontrada com esses filtros."
            : "Nenhuma categoria de produto cadastrada. Cadastre a primeira!"
          : undefined
      }
      cards={categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center justify-between gap-2 p-4"
        >
          <div className="space-y-1">
            <p className="font-medium">{category.name}</p>
            <StatusBadge active={category.isActive} />
          </div>
          <Actions
            category={category}
            onEdit={edit}
            onDeactivate={setDeactivating}
            onRestore={restore}
            busy={restoring}
          />
        </li>
      ))}
      rows={categories.map((category) => (
        <tr key={category.id} className="hover:bg-background">
          <td className="px-4 py-3 font-medium">{category.name}</td>
          <td className="px-4 py-3">
            <StatusBadge active={category.isActive} />
          </td>
          <td className="px-4 py-2">
            <Actions
              category={category}
              onEdit={edit}
              onDeactivate={setDeactivating}
              onRestore={restore}
              busy={restoring}
            />
          </td>
        </tr>
      ))}
      footer={footer}
    >
      <ProductCategoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        category={editing}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar categoria de produto?"
        description={`${deactivating?.name ?? ""} deixará de aparecer ao cadastrar produtos. Só dá para inativar a categoria sem produtos ativos, e você poderá reativá-la depois.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        onConfirm={confirmDeactivate}
      />
    </ListCard>
  );
}
