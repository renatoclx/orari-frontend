"use client";

import { useState, useTransition } from "react";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  deleteExpenseCategoryAction,
  restoreExpenseCategoryAction,
} from "@/app/(admin)/expense-category-actions";
import { ExpenseCategoryFormDialog } from "@/components/expense-categories/ExpenseCategoryFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { ExpenseCategoryItem } from "@/types/expense-category";
import { useCan } from "@/components/layout/Access";

type ExpenseCategoryListProps = {
  categories: ExpenseCategoryItem[];
  /** Termo da busca atual, para a mensagem de lista vazia. */
  search: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Coluna Ações: poucas, então ficam à vista. Ativo: Editar e Inativar.
// Inativa: só Reativar (a API não altera categoria inativa).
function Actions({
  category,
  onEdit,
  onDeactivate,
  onRestore,
  busy,
}: {
  category: ExpenseCategoryItem;
  onEdit: (category: ExpenseCategoryItem) => void;
  onDeactivate: (category: ExpenseCategoryItem) => void;
  onRestore: (category: ExpenseCategoryItem) => void;
  /** Há uma reativação em andamento. */
  busy: boolean;
}) {
  const canEdit = useCan("expense-categories", "edit");
  const canRemove = useCan("expense-categories", "remove");
  if (category.deletedAt !== null) {
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
export function ExpenseCategoryList({
  categories,
  search,
  footer,
}: ExpenseCategoryListProps) {
  // A categoria fica guardada ao fechar, para o dialog não trocar de título
  // durante a animação de saída.
  const [editing, setEditing] = useState<ExpenseCategoryItem>();
  const [editOpen, setEditOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<ExpenseCategoryItem | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();

  function restore(category: ExpenseCategoryItem) {
    startRestore(async () => {
      const result = await restoreExpenseCategoryAction(category.id);
      if (result.ok) {
        toast.success("Categoria de despesa reativada.", {
          description: category.name,
        });
      } else {
        toast.error("Não foi possível reativar a categoria de despesa.", {
          description: result.message,
        });
      }
    });
  }

  function edit(category: ExpenseCategoryItem) {
    setEditing(category);
    setEditOpen(true);
  }

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await deleteExpenseCategoryAction(target.id);
      if (result.ok) {
        toast.success("Categoria de despesa inativada.", {
          description: target.name,
        });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar a categoria de despesa.", {
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
          ? search
            ? `Nenhuma categoria de despesa encontrada para “${search}”.`
            : "Nenhuma categoria de despesa cadastrada. Cadastre a primeira!"
          : undefined
      }
      cards={categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center justify-between gap-2 p-4"
        >
          <div className="space-y-1">
            <p className="font-medium">{category.name}</p>
            <StatusBadge active={category.deletedAt === null} />
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
            <StatusBadge active={category.deletedAt === null} />
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
      <ExpenseCategoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        category={editing}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar categoria de despesa?"
        description={`${deactivating?.name ?? ""} deixará de aparecer ao lançar contas a pagar. As contas já lançadas com ela não mudam, e você poderá reativá-la depois.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        onConfirm={confirmDeactivate}
      />
    </ListCard>
  );
}
