"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Ban, Eye } from "lucide-react";
import { toast } from "sonner";
import { cancelClientPlanAction } from "@/app/(admin)/client-plan-actions";
import {
  BILLING_LABEL,
  clientPlanStatus,
} from "@/components/client-plans/client-plan-status";
import { ClientPlanStatusBadge } from "@/components/client-plans/ClientPlanStatusBadge";
import { CancelClientPlanDialog } from "@/components/client-plans/CancelClientPlanDialog";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import type { ClientPlanItem } from "@/types/client-plan";
import { formatDateOnly, formatPrice } from "@/utils/format";

type ClientPlanListProps = {
  items: ClientPlanItem[];
  /** Hoje no fuso da empresa (situação: ativa ou encerrada). */
  today: string;
  /** Há filtro aplicado, para a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

const period = (item: ClientPlanItem) =>
  `${formatDateOnly(item.startDate)} a ${formatDateOnly(item.endDate)}`;

// Coluna Ações: Visualizar e, enquanto ativa, Cancelar contratação.
function Actions({
  item,
  active,
  onCancel,
}: {
  item: ClientPlanItem;
  active: boolean;
  onCancel: (item: ClientPlanItem) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Hint label="Visualizar contratação">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={`Visualizar a contratação de ${item.client.name}`}
        >
          <Link href={`/pacotes/contratacoes/${item.id}`}>
            <Eye aria-hidden="true" />
          </Link>
        </Button>
      </Hint>
      {active && (
        <Hint label="Cancelar contratação">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cancelar a contratação de ${item.client.name}`}
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
export function ClientPlanList({
  items,
  today,
  filtered,
  footer,
}: ClientPlanListProps) {
  const [cancelling, setCancelling] = useState<ClientPlanItem | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmCancel() {
    if (!cancelling) return;
    const target = cancelling;
    startTransition(async () => {
      const result = await cancelClientPlanAction(target.id);
      if (result.ok) {
        toast.success("Contratação cancelada.", {
          description: `${target.client.name} · ${target.plan.name}`,
        });
        setCancelling(null);
      } else {
        toast.error("Não foi possível cancelar a contratação.", {
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
        {items.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhuma contratação encontrada para os filtros."
              : "Nenhuma contratação feita. Faça a primeira!"}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {items.map((item) => {
                const status = clientPlanStatus(item, today);
                return (
                  <li key={item.id} className="space-y-1 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{item.client.name}</p>
                      <Actions
                        item={item}
                        active={status === "active"}
                        onCancel={setCancelling}
                      />
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                      <dt className="text-muted-foreground">Plano</dt>
                      <dd>{item.plan.name}</dd>
                      <dt className="text-muted-foreground">Período</dt>
                      <dd className="tabular-nums">{period(item)}</dd>
                      <dt className="text-muted-foreground">Modalidade</dt>
                      <dd>{BILLING_LABEL[item.billingType]}</dd>
                      <dt className="text-muted-foreground">Total</dt>
                      <dd className="tabular-nums">
                        {formatPrice(item.totalAmount)}
                      </dd>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <ClientPlanStatusBadge status={status} />
                      </dd>
                    </dl>
                  </li>
                );
              })}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {[
                    "Cliente",
                    "Plano",
                    "Período",
                    "Modalidade",
                    "Total",
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
                {items.map((item) => {
                  const status = clientPlanStatus(item, today);
                  return (
                    <tr key={item.id} className="hover:bg-background">
                      <td className="px-4 py-3 font-medium">
                        {item.client.name}
                      </td>
                      <td className="px-4 py-3">{item.plan.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        {period(item)}
                      </td>
                      <td className="px-4 py-3">
                        {BILLING_LABEL[item.billingType]}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        {formatPrice(item.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <ClientPlanStatusBadge status={status} />
                      </td>
                      <td className="px-4 py-2">
                        <Actions
                          item={item}
                          active={status === "active"}
                          onCancel={setCancelling}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <CancelClientPlanDialog
        item={cancelling}
        pending={pending}
        onOpenChange={(open) => !open && setCancelling(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
