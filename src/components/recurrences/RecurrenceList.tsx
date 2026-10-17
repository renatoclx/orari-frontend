"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Ban, Eye } from "lucide-react";
import { toast } from "sonner";
import { cancelRecurrenceAction } from "@/app/(admin)/recurrence-actions";
import { describeDays } from "@/components/recurrences/recurrence-schedule";
import { RecurrenceStatusBadge } from "@/components/recurrences/RecurrenceStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import type { RecurrenceItem } from "@/types/recurrence";
import { formatDateOnly } from "@/utils/format";

type RecurrenceListProps = {
  recurrences: RecurrenceItem[];
  /** Há filtro aplicado, para a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

const period = (item: RecurrenceItem) =>
  `${formatDateOnly(item.startDate)} a ${formatDateOnly(item.endDate)}`;

// Coluna Ações: Visualizar e, enquanto a recorrência está ativa, Cancelar.
function RecurrenceActions({
  item,
  onCancel,
}: {
  item: RecurrenceItem;
  onCancel: (item: RecurrenceItem) => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-start gap-1">
      <Hint label="Visualizar recorrência">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={`Visualizar recorrência de ${item.client.name}`}
        >
          <Link href={`/recorrencias/${item.id}`}>
            <Eye aria-hidden="true" />
          </Link>
        </Button>
      </Hint>
      {/* A recorrência de um pacote só é encerrada pela contratação. */}
      {item.isActive && !item.clientPlanId && (
        <Hint label="Cancelar recorrência">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cancelar recorrência de ${item.client.name}`}
            onClick={() => onCancel(item)}
          >
            <Ban aria-hidden="true" />
          </Button>
        </Hint>
      )}
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function RecurrenceList({
  recurrences,
  filtered,
  footer,
}: RecurrenceListProps) {
  const [cancelling, setCancelling] = useState<RecurrenceItem | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmCancel() {
    if (!cancelling) return;
    const target = cancelling;

    startTransition(async () => {
      const result = await cancelRecurrenceAction(target.id);
      if (result.ok) {
        toast.success("Recorrência cancelada.", {
          description: target.client.name,
        });
        setCancelling(null);
      } else {
        toast.error("Não foi possível cancelar a recorrência.", {
          description: result.message,
        });
      }
    });
  }

  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {recurrences.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhuma recorrência encontrada para os filtros."
              : "Nenhuma recorrência cadastrada. Cadastre a primeira!"}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border md:hidden">
              {recurrences.map((item) => (
                <li key={item.id} className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.client.name}</p>
                    <RecurrenceActions item={item} onCancel={setCancelling} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    <dt className="text-muted-foreground">Serviço</dt>
                    <dd>{item.service.name}</dd>
                    <dt className="text-muted-foreground">Profissional</dt>
                    <dd>{item.professional.name}</dd>
                    <dt className="text-muted-foreground">Dias</dt>
                    <dd>{describeDays(item.days)}</dd>
                    <dt className="text-muted-foreground">Período</dt>
                    <dd className="tabular-nums">{period(item)}</dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <RecurrenceStatusBadge active={item.isActive} />
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {[
                    "Cliente",
                    "Profissional",
                    "Serviço",
                    "Dias",
                    "Período",
                    "Status",
                    "Ações",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recurrences.map((item) => (
                  <tr key={item.id} className="hover:bg-background">
                    <td className="px-4 py-3 font-medium">
                      {item.client.name}
                    </td>
                    <td className="px-4 py-3">{item.professional.name}</td>
                    <td className="px-4 py-3">{item.service.name}</td>
                    <td className="px-4 py-3">{describeDays(item.days)}</td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {period(item)}
                    </td>
                    <td className="px-4 py-3">
                      <RecurrenceStatusBadge active={item.isActive} />
                    </td>
                    <td className="px-4 py-2">
                      <RecurrenceActions item={item} onCancel={setCancelling} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="Cancelar recorrência?"
        description={`A recorrência de ${cancelling?.client.name ?? ""} será cancelada e as sessões futuras que ainda não começaram serão canceladas, liberando os horários. O que já aconteceu permanece.`}
        confirmLabel="Cancelar recorrência"
        icon={Ban}
        pendingLabel="Cancelando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        onConfirm={confirmCancel}
      />
    </div>
  );
}
