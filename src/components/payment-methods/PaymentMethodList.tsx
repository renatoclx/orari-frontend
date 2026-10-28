"use client";

import { useState, useTransition } from "react";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  deletePaymentMethodAction,
  restorePaymentMethodAction,
} from "@/app/(admin)/payment-method-actions";
import { PaymentMethodFormDialog } from "@/components/payment-methods/PaymentMethodFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { PaymentMethodItem } from "@/types/payment-method";

type PaymentMethodListProps = {
  methods: PaymentMethodItem[];
  /** Termo da busca atual, para a mensagem de lista vazia. */
  search: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Coluna Ações: poucas, então ficam à vista. Ativo: Editar e Inativar.
// Inativo: só Reativar (a API não altera método inativo).
function Actions({
  method,
  onEdit,
  onDeactivate,
  onRestore,
  busy,
}: {
  method: PaymentMethodItem;
  onEdit: (method: PaymentMethodItem) => void;
  onDeactivate: (method: PaymentMethodItem) => void;
  onRestore: (method: PaymentMethodItem) => void;
  /** Há uma reativação em andamento. */
  busy: boolean;
}) {
  if (method.deletedAt !== null) {
    return (
      <Hint label={`Reativar ${method.name}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Reativar ${method.name}`}
          disabled={busy}
          onClick={() => onRestore(method)}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </Hint>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Hint label={`Alterar ${method.name}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Alterar ${method.name}`}
          onClick={() => onEdit(method)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </Hint>
      <Hint label={`Inativar ${method.name}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Inativar ${method.name}`}
          onClick={() => onDeactivate(method)}
        >
          <Ban aria-hidden="true" />
        </Button>
      </Hint>
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function PaymentMethodList({
  methods,
  search,
  footer,
}: PaymentMethodListProps) {
  // O método fica guardado ao fechar, para o dialog não trocar de título
  // durante a animação de saída.
  const [editing, setEditing] = useState<PaymentMethodItem>();
  const [editOpen, setEditOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<PaymentMethodItem | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();

  function restore(method: PaymentMethodItem) {
    startRestore(async () => {
      const result = await restorePaymentMethodAction(method.id);
      if (result.ok) {
        toast.success("Método de pagamento reativado.", {
          description: method.name,
        });
      } else {
        toast.error("Não foi possível reativar o método de pagamento.", {
          description: result.message,
        });
      }
    });
  }

  function edit(method: PaymentMethodItem) {
    setEditing(method);
    setEditOpen(true);
  }

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await deletePaymentMethodAction(target.id);
      if (result.ok) {
        toast.success("Método de pagamento inativado.", {
          description: target.name,
        });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar o método de pagamento.", {
          description: result.message,
        });
      }
    });
  }

  return (
    <ListCard
      columns={["Nome", "Status", "Ações"]}
      emptyMessage={
        methods.length === 0
          ? search
            ? `Nenhum método de pagamento encontrado para “${search}”.`
            : "Nenhum método de pagamento cadastrado. Cadastre o primeiro!"
          : undefined
      }
      cards={methods.map((method) => (
        <li
          key={method.id}
          className="flex items-center justify-between gap-2 p-4"
        >
          <div className="space-y-1">
            <p className="font-medium">{method.name}</p>
            <StatusBadge active={method.deletedAt === null} />
          </div>
          <Actions
            method={method}
            onEdit={edit}
            onDeactivate={setDeactivating}
            onRestore={restore}
            busy={restoring}
          />
        </li>
      ))}
      rows={methods.map((method) => (
        <tr key={method.id} className="hover:bg-background">
          <td className="px-4 py-3 font-medium">{method.name}</td>
          <td className="px-4 py-3">
            <StatusBadge active={method.deletedAt === null} />
          </td>
          <td className="px-4 py-2">
            <Actions
              method={method}
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
      <PaymentMethodFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        method={editing}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar método de pagamento?"
        description={`${deactivating?.name ?? ""} deixará de aparecer nas baixas de pagamento. Os pagamentos já recebidos com ele não mudam, e você poderá reativá-lo depois.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        onConfirm={confirmDeactivate}
      />
    </ListCard>
  );
}
