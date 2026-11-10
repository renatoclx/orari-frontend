"use client";

import { Printer, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelClosingAction } from "@/app/(admin)/commission-actions";
import {
  receiptHref,
  receiptNumber,
} from "@/components/commissions/commission-filters";
import { useCan } from "@/components/layout/Access";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { Button } from "@/components/ui/button";
import type { ClosingItem } from "@/types/commission";
import { formatDateOnly, formatPrice } from "@/utils/format";

const day = (date: string) => formatDateOnly(`${date}T00:00:00Z`);

/**
 * Fechamentos do profissional (o mais recente primeiro): reimprimir o recibo
 * e desfazer o último ainda válido.
 */
export function ClosingList({
  closings,
  professionalName,
  tabs,
}: {
  closings: ClosingItem[];
  professionalName: string;
  /** Abas do quadro do profissional. */
  tabs: React.ReactNode;
}) {
  const canCancel = useCan("commissions", "remove");
  const [cancelling, setCancelling] = useState<ClosingItem | null>(null);
  const [pending, startTransition] = useTransition();
  // Só o último não desfeito pode ser desfeito.
  const lastActiveId = closings.find((closing) => !closing.cancelledAt)?.id;

  function confirmCancel() {
    if (!cancelling) return;
    startTransition(async () => {
      const result = await cancelClosingAction(cancelling.id);
      if (result.ok) {
        toast.success(
          `Fechamento nº ${receiptNumber(cancelling.number)} desfeito.`,
        );
        setCancelling(null);
        return;
      }
      toast.error("Não foi possível desfazer o fechamento.", {
        description: result.message,
      });
    });
  }

  function actions(closing: ClosingItem) {
    const label = receiptNumber(closing.number);
    return (
      <div className="flex items-center gap-1">
        <Hint label="Imprimir recibo">
          <Button variant="ghost" size="icon" asChild>
            <a
              href={receiptHref(closing.id)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Imprimir recibo nº ${label}`}
            >
              <Printer aria-hidden="true" />
            </a>
          </Button>
        </Hint>
        {canCancel && closing.id === lastActiveId && (
          <Hint label="Desfazer fechamento">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCancelling(closing)}
              aria-label={`Desfazer fechamento nº ${label}`}
            >
              <Undo2 aria-hidden="true" />
            </Button>
          </Hint>
        )}
      </div>
    );
  }

  // Número com "Desfeito" ao lado quando o recibo foi cancelado.
  const number = (closing: ClosingItem) => (
    <span className="flex items-center gap-2 whitespace-nowrap">
      {receiptNumber(closing.number)}
      {closing.cancelledAt && (
        <span className="text-xs text-muted-foreground">(desfeito)</span>
      )}
    </span>
  );

  return (
    <ListCard
      toolbar={tabs}
      columns={[
        "Nº",
        "Até",
        "Pago em",
        "Método",
        "Comissões",
        "Adiantado",
        "Pago",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        closings.length > 0
          ? undefined
          : "Nenhum fechamento deste profissional."
      }
      rows={closings.map((closing) => (
        <tr
          key={closing.id}
          className={`tabular-nums hover:bg-background ${closing.cancelledAt ? "text-muted-foreground" : ""}`}
        >
          <td className="px-4 py-3">{number(closing)}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {day(closing.cutoffDate)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">{day(closing.paidAt)}</td>
          <td className="px-4 py-3">{closing.paymentMethod.name}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatPrice(closing.commissionTotal)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatPrice(closing.advanceTotal)}
          </td>
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {formatPrice(closing.paidAmount)}
          </td>
          <td className="px-4 py-2">{actions(closing)}</td>
        </tr>
      ))}
      cards={closings.map((closing) => (
        <li key={closing.id} className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium">Nº {number(closing)}</span>
            {actions(closing)}
          </div>
          <p className="text-sm tabular-nums">
            Pago {formatPrice(closing.paidAmount)} em {day(closing.paidAt)} ·{" "}
            {closing.paymentMethod.name}
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            Até {day(closing.cutoffDate)} · comissões{" "}
            {formatPrice(closing.commissionTotal)} − adiantado{" "}
            {formatPrice(closing.advanceTotal)}
          </p>
        </li>
      ))}
    >
      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && !pending && setCancelling(null)}
        title="Desfazer fechamento?"
        description={
          cancelling
            ? `O fechamento nº ${receiptNumber(cancelling.number)} de ${professionalName} fica cancelado (o recibo continua consultável, marcado como cancelado) e as comissões e os adiantamentos dele voltam a ficar em aberto.`
            : ""
        }
        confirmLabel="Desfazer"
        pendingLabel="Desfazendo…"
        pending={pending}
        destructive
        cancelLabel="Voltar"
        icon={Undo2}
        onConfirm={confirmCancel}
      />
    </ListCard>
  );
}
