"use client";

import {
  Ban,
  EllipsisVertical,
  HandCoins,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  cancelPayableAction,
  deletePayableAction,
} from "@/app/(admin)/payable-actions";
import { PaymentBadge } from "@/components/client-plans/ClientPlanParts";
import { useCan } from "@/components/layout/Access";
import {
  PayableFormDialog,
  type PayeeOption,
} from "@/components/payables/PayableFormDialog";
import { payableTitle } from "@/components/payables/payable-filters";
import { SettlePayablesDialog } from "@/components/payables/SettlePayablesDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PayableItem } from "@/types/payable";
import type { PaymentMethodItem } from "@/types/payment-method";
import { formatDateOnly, formatPrice } from "@/utils/format";

type PayableListProps = {
  payables: PayableItem[];
  payees: PayeeOption[];
  categories: { id: string; name: string }[];
  /** Métodos ativos, para pagar. */
  methods: PaymentMethodItem[];
  today: string;
  /** Há filtro além do padrão: muda a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

const pendingOnly = (payable: PayableItem) => payable.status === "PENDING";
const day = (date: string) => formatDateOnly(`${date}T00:00:00Z`);

/** Contas a pagar com pagamento único e em lote (screens/contas-a-pagar.md). */
export function PayableList({
  payables,
  payees,
  categories,
  methods,
  today,
  filtered,
  footer,
}: PayableListProps) {
  const canEdit = useCan("payables", "edit");
  const canRemove = useCan("payables", "remove");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Guardados ao fechar, para o diálogo não mudar durante a animação.
  const [settling, setSettling] = useState<PayableItem[]>([]);
  const [settleOpen, setSettleOpen] = useState(false);
  const [editing, setEditing] = useState<PayableItem | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<{
    payable: PayableItem;
    action: "cancel" | "delete";
  } | null>(null);
  const [pending, startTransition] = useTransition();

  // A seleção só vale para as pendentes da página.
  const chosen = payables.filter(
    (payable) => selected.has(payable.id) && pendingOnly(payable),
  );
  const chosenTotal =
    chosen.reduce(
      (sum, payable) => sum + Math.round(Number(payable.amount) * 100),
      0,
    ) / 100;

  function toggle(payable: PayableItem, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(payable.id);
      else next.delete(payable.id);
      return next;
    });
  }

  function settle(items: PayableItem[]) {
    setSettling(items);
    setSettleOpen(true);
  }

  function runConfirm() {
    if (!confirm) return;
    const { payable, action } = confirm;
    startTransition(async () => {
      const result =
        action === "cancel"
          ? await cancelPayableAction(payable.id)
          : await deletePayableAction(payable.id);
      if (result.ok) {
        toast.success(
          action === "cancel" ? "Conta cancelada." : "Conta excluída.",
          { description: payableTitle(payable) },
        );
        setConfirm(null);
        return;
      }
      toast.error(
        action === "cancel"
          ? "Não foi possível cancelar a conta."
          : "Não foi possível excluir a conta.",
        { description: result.message },
      );
    });
  }

  function checkbox(payable: PayableItem) {
    if (!pendingOnly(payable) || !canEdit) return null;
    return (
      <input
        type="checkbox"
        className="size-4 accent-primary"
        aria-label={`Selecionar ${payableTitle(payable)}`}
        checked={selected.has(payable.id)}
        onChange={(event) => toggle(payable, event.target.checked)}
      />
    );
  }

  function actions(payable: PayableItem) {
    const isPending = pendingOnly(payable);
    // Excluir: lançamento errado, pendente ou cancelado (paga não).
    const canDelete = canRemove && payable.status !== "PAID";
    return (
      <div className="flex shrink-0 items-center gap-1">
        {isPending && canEdit && (
          <Button size="sm" onClick={() => settle([payable])}>
            <HandCoins aria-hidden="true" />
            Pagar
          </Button>
        )}
        {isPending && canEdit && (
          <Hint label="Alterar">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Alterar ${payableTitle(payable)}`}
              onClick={() => {
                setEditing(payable);
                setEditOpen(true);
              }}
            >
              <Pencil aria-hidden="true" />
            </Button>
          </Hint>
        )}
        {(isPending || canDelete) && canRemove && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Mais ações de ${payableTitle(payable)}`}
              >
                <EllipsisVertical aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPending && (
                <DropdownMenuItem
                  onSelect={() => setConfirm({ payable, action: "cancel" })}
                >
                  <Ban aria-hidden="true" />
                  Cancelar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setConfirm({ payable, action: "delete" })}
                >
                  <Trash2 aria-hidden="true" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  const paidLabel = (payable: PayableItem) =>
    payable.paidAt
      ? `${day(payable.paidAt)} · ${payable.paymentMethod?.name ?? "--"}`
      : null;
  const badge = (payable: PayableItem) => (
    <PaymentBadge
      payment={{ status: payable.status, isOverdue: payable.overdue }}
    />
  );

  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium whitespace-nowrap text-muted-foreground";

  return (
    <div className="flex min-h-[24rem] flex-1 flex-col rounded-card border border-border bg-card md:min-h-0">
      {chosen.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted px-4 py-2 text-sm">
          <span className="tabular-nums">
            {chosen.length}{" "}
            {chosen.length === 1 ? "selecionada" : "selecionadas"} ·{" "}
            <strong>{formatPrice(chosenTotal)}</strong>
          </span>
          <Button size="sm" onClick={() => settle(chosen)}>
            <HandCoins aria-hidden="true" />
            Pagar selecionadas
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            <X aria-hidden="true" />
            Limpar seleção
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {payables.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhuma conta encontrada para os filtros escolhidos."
              : "Nenhuma conta pendente."}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {payables.map((payable) => (
                <li key={payable.id} className="flex gap-3 p-4">
                  {/* Sem caixa (paga, cancelada), o texto não fica recuado. */}
                  {checkbox(payable) && (
                    <div className="pt-0.5">{checkbox(payable)}</div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium">{payableTitle(payable)}</p>
                    <p className="text-sm text-muted-foreground">
                      {payable.category.name}
                      {payable.payee && ` · ${payable.payee.name}`}
                    </p>
                    <p className="text-sm tabular-nums">
                      {formatPrice(payable.amount)} · Vence em{" "}
                      {day(payable.dueDate)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {badge(payable)}
                      {paidLabel(payable) && (
                        <span className="text-sm text-muted-foreground">
                          {paidLabel(payable)}
                        </span>
                      )}
                    </div>
                    {actions(payable)}
                  </div>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  <th scope="col" className={`${headerClass} w-10`}>
                    <span className="sr-only">Selecionar</span>
                  </th>
                  {[
                    "Vencimento",
                    "Descrição",
                    "Favorecido",
                    "Categoria",
                    "Valor",
                    "Status",
                    "Pago em",
                    "Ações",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payables.map((payable) => (
                  <tr
                    key={payable.id}
                    className="tabular-nums hover:bg-background"
                  >
                    <td className="px-4 py-3">{checkbox(payable)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {day(payable.dueDate)}
                    </td>
                    {/* Largura mínima: a coluna "Pago em" não espreme o nome. */}
                    <td className="min-w-48 px-4 py-3 font-medium">
                      {payableTitle(payable)}
                    </td>
                    <td className="px-4 py-3">
                      <EmptyValue>{payable.payee?.name}</EmptyValue>
                    </td>
                    <td className="px-4 py-3">{payable.category.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPrice(payable.amount)}
                    </td>
                    <td className="px-4 py-3">{badge(payable)}</td>
                    {/* Data e método em duas linhas: a tabela não alarga
                        a ponto de esconder as ações. */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {payable.paidAt ? (
                        <>
                          {day(payable.paidAt)}
                          <span className="block text-muted-foreground">
                            {payable.paymentMethod?.name ?? "--"}
                          </span>
                        </>
                      ) : (
                        <EmptyValue />
                      )}
                    </td>
                    <td className="px-4 py-2">{actions(payable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <SettlePayablesDialog
        open={settleOpen}
        onOpenChange={setSettleOpen}
        payables={settling}
        methods={methods}
        today={today}
        onSettled={() => setSelected(new Set())}
      />
      <PayableFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        payable={editing}
        payees={payees}
        categories={categories}
        methods={methods}
        today={today}
      />
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && !pending && setConfirm(null)}
        title={
          confirm?.action === "delete" ? "Excluir conta?" : "Cancelar conta?"
        }
        description={
          confirm
            ? confirm.action === "delete"
              ? `${payableTitle(confirm.payable)} (${formatPrice(confirm.payable.amount)}) será apagada. Use para um lançamento errado.`
              : `${payableTitle(confirm.payable)} (${formatPrice(confirm.payable.amount)}) fica cancelada e continua no histórico. As outras contas da repetição não mudam.`
            : ""
        }
        confirmLabel={
          confirm?.action === "delete" ? "Excluir" : "Cancelar conta"
        }
        pendingLabel={
          confirm?.action === "delete" ? "Excluindo…" : "Cancelando…"
        }
        pending={pending}
        destructive
        cancelLabel="Voltar"
        icon={confirm?.action === "delete" ? Trash2 : Ban}
        onConfirm={runConfirm}
      />
    </div>
  );
}
