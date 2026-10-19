"use client";

import { useState } from "react";
import { ListChecks, Package } from "lucide-react";
import { useAgendaClock } from "@/components/agenda/useAgendaClock";
import {
  BILLING_LABEL,
  clientPlanStatus,
} from "@/components/client-plans/client-plan-status";
import { ClientPlanDialog } from "@/components/client-plans/ClientPlanDialog";
import { ClientPlanStatusBadge } from "@/components/client-plans/ClientPlanStatusBadge";
import { describeDays } from "@/components/recurrences/recurrence-schedule";
import { RecurrenceSessionsDialog } from "@/components/recurrences/RecurrenceSessionsDialog";
import { RecurrenceStatusBadge } from "@/components/recurrences/RecurrenceStatusBadge";
import { Button } from "@/components/ui/button";
import type { ClientPlanItem } from "@/types/client-plan";
import type { RecurrenceItem } from "@/types/recurrence";
import { formatDateOnly, formatPrice } from "@/utils/format";

type Props = {
  /** Uma das duas listas, conforme a aba. */
  recurrences?: RecurrenceItem[];
  clientPlans?: ClientPlanItem[];
  timeZone: string;
  serverNow: number;
  footer: React.ReactNode;
};

const headerClass =
  "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

/**
 * Abas de recorrências e de pacotes do cliente: as linhas abrem as sessões ou a
 * contratação em dialog, sem sair do histórico.
 */
export function HistoryRecurrencesAndPlans({
  recurrences,
  clientPlans,
  timeZone,
  serverNow,
  footer,
}: Props) {
  const { today, nowTime } = useAgendaClock(timeZone, serverNow);
  const [sessionsOf, setSessionsOf] = useState<string | null>(null);
  const [clientPlanOf, setClientPlanOf] = useState<string | null>(null);
  const empty = (recurrences ?? clientPlans ?? []).length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {empty ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {recurrences
              ? "Nenhuma recorrência deste cliente."
              : "Nenhum pacote contratado por este cliente."}
          </p>
        ) : recurrences ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {[
                  "Serviço",
                  "Profissional",
                  "Dias",
                  "Período",
                  "Status",
                  "",
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
                    {item.service.name}
                    {item.clientPlanId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (pacote)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{item.professional.name}</td>
                  <td className="px-4 py-3">{describeDays(item.days)}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {formatDateOnly(item.startDate)} a{" "}
                    {formatDateOnly(item.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <RecurrenceStatusBadge active={item.isActive} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="outline"
                      onClick={() => setSessionsOf(item.id)}
                    >
                      <ListChecks aria-hidden="true" />
                      Ver sessões
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Plano", "Período", "Modalidade", "Total", "Status", ""].map(
                  (title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientPlans?.map((item) => (
                <tr key={item.id} className="hover:bg-background">
                  <td className="px-4 py-3 font-medium">{item.plan.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {formatDateOnly(item.startDate)} a{" "}
                    {formatDateOnly(item.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    {BILLING_LABEL[item.billingType]}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {formatPrice(item.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <ClientPlanStatusBadge
                      status={clientPlanStatus(item, today)}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="outline"
                      onClick={() => setClientPlanOf(item.id)}
                    >
                      <Package aria-hidden="true" />
                      Ver contratação
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {footer}

      <RecurrenceSessionsDialog
        recurrenceId={sessionsOf}
        timeZone={timeZone}
        today={today}
        nowTime={nowTime}
        onOpenChange={(open) => !open && setSessionsOf(null)}
      />
      <ClientPlanDialog
        clientPlanId={clientPlanOf}
        today={today}
        onViewSessions={(recurrenceId) => {
          setClientPlanOf(null);
          setSessionsOf(recurrenceId);
        }}
        onOpenChange={(open) => !open && setClientPlanOf(null)}
      />
    </div>
  );
}
