"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteAdvanceAction } from "@/app/(admin)/commission-actions";
import { useCan } from "@/components/layout/Access";
import { receiptNumber } from "@/components/commissions/commission-filters";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { Button } from "@/components/ui/button";
import type { CommissionAdvance } from "@/types/commission";
import { formatDateOnly, formatPrice } from "@/utils/format";

const day = (date: string) => formatDateOnly(`${date}T00:00:00Z`);

/**
 * Adiantamentos do profissional: os do período e os em aberto de qualquer
 * data, com a situação. A lixeira só aparece nos em aberto (o fechado já foi
 * abatido e está no recibo).
 */
export function AdvanceList({
  advances,
  professionalName,
  tabs,
}: {
  advances: CommissionAdvance[];
  professionalName: string;
  /** Abas do quadro (Atendimentos | Adiantamentos). */
  tabs: React.ReactNode;
}) {
  const canRemove = useCan("commissions", "remove");
  const [removing, setRemoving] = useState<CommissionAdvance | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmRemove() {
    if (!removing) return;
    startTransition(async () => {
      const result = await deleteAdvanceAction(removing.id);
      if (result.ok) {
        toast.success("Adiantamento excluído.");
        setRemoving(null);
        return;
      }
      toast.error("Não foi possível excluir o adiantamento.", {
        description: result.message,
      });
    });
  }

  const remove = (advance: CommissionAdvance) =>
    canRemove && !advance.closing ? (
      <Hint label="Excluir adiantamento">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRemoving(advance)}
          aria-label={`Excluir adiantamento de ${formatPrice(advance.amount)} em ${day(advance.date)}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </Hint>
    ) : null;

  // Em aberto ou o número do fechamento que o abateu.
  const situation = (advance: CommissionAdvance) =>
    advance.closing
      ? `Fechado nº ${receiptNumber(advance.closing.number)}`
      : "Em aberto";

  return (
    <ListCard
      toolbar={tabs}
      columns={[
        "Data",
        "Valor",
        "Método",
        "Observação",
        "Lançado por",
        "Situação",
        { key: "Ações", header: <span className="sr-only">Ações</span> },
      ]}
      emptyMessage={
        advances.length > 0
          ? undefined
          : "Nenhum adiantamento no período nem em aberto."
      }
      rows={advances.map((advance) => (
        <tr key={advance.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3 whitespace-nowrap">{day(advance.date)}</td>
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {formatPrice(advance.amount)}
          </td>
          <td className="px-4 py-3">
            <EmptyValue>{advance.paymentMethod?.name}</EmptyValue>
          </td>
          <td className="px-4 py-3">{advance.note ?? "--"}</td>
          <td className="px-4 py-3">{advance.createdBy.name}</td>
          <td className="px-4 py-3 whitespace-nowrap">{situation(advance)}</td>
          <td className="px-4 py-2">{remove(advance)}</td>
        </tr>
      ))}
      cards={advances.map((advance) => (
        <li key={advance.id} className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="font-semibold tabular-nums">
              {formatPrice(advance.amount)}
            </span>
            {remove(advance)}
          </div>
          <p className="text-sm">{advance.note ?? "Sem observação"}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {day(advance.date)}
            {advance.paymentMethod && ` · ${advance.paymentMethod.name}`} ·
            Lançado por {advance.createdBy.name} · {situation(advance)}
          </p>
        </li>
      ))}
    >
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && !pending && setRemoving(null)}
        title="Excluir adiantamento?"
        description={
          removing
            ? `O adiantamento de ${formatPrice(removing.amount)} para ${professionalName}, lançado em ${day(removing.date)}, deixa de ser abatido no fechamento.`
            : ""
        }
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        pending={pending}
        destructive
        cancelLabel="Voltar"
        icon={Trash2}
        onConfirm={confirmRemove}
      />
    </ListCard>
  );
}
