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
import { ListCard } from "@/components/shared/ListCard";
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

  // Ação da linha: só o ícone no celular (o cartão é estreito); com texto na tabela.
  const sessionsButton = (item: RecurrenceItem, icon: boolean) => (
    <Button
      variant="outline"
      size={icon ? "icon" : "default"}
      aria-label={icon ? `Ver sessões de ${item.service.name}` : undefined}
      onClick={() => setSessionsOf(item.id)}
    >
      <ListChecks aria-hidden="true" />
      {!icon && "Ver sessões"}
    </Button>
  );
  const planButton = (item: ClientPlanItem, icon: boolean) => (
    <Button
      variant="outline"
      size={icon ? "icon" : "default"}
      aria-label={icon ? `Ver contratação de ${item.plan.name}` : undefined}
      onClick={() => setClientPlanOf(item.id)}
    >
      <Package aria-hidden="true" />
      {!icon && "Ver contratação"}
    </Button>
  );
  const period = (item: { startDate: string; endDate: string }) =>
    `${formatDateOnly(item.startDate)} a ${formatDateOnly(item.endDate)}`;

  return (
    <ListCard
      columns={
        recurrences
          ? [
              "Serviço",
              "Profissional",
              "Dias",
              "Período",
              "Status",
              // Só botões: o título fica para leitor de tela.
              { key: "acoes", header: <span className="sr-only">Ações</span> },
            ]
          : [
              "Plano",
              "Período",
              "Modalidade",
              "Total",
              "Status",
              { key: "acoes", header: <span className="sr-only">Ações</span> },
            ]
      }
      emptyMessage={
        empty
          ? recurrences
            ? "Nenhuma recorrência deste cliente."
            : "Nenhum pacote contratado por este cliente."
          : undefined
      }
      cards={
        recurrences
          ? recurrences.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 p-4"
              >
                <div className="min-w-0 space-y-0.5 text-sm">
                  <p className="font-medium">
                    {item.service.name}
                    {item.clientPlanId && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (pacote)
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    com {item.professional.name}
                  </p>
                  <p>{describeDays(item.days)}</p>
                  <p className="text-muted-foreground tabular-nums">
                    {period(item)}
                  </p>
                  <div className="pt-1">
                    <RecurrenceStatusBadge active={item.isActive} />
                  </div>
                </div>
                {sessionsButton(item, true)}
              </li>
            ))
          : clientPlans?.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 p-4"
              >
                <div className="min-w-0 space-y-0.5 text-sm">
                  <p className="font-medium">{item.plan.name}</p>
                  <p className="text-muted-foreground tabular-nums">
                    {period(item)}
                  </p>
                  <p className="tabular-nums">
                    {BILLING_LABEL[item.billingType]} ·{" "}
                    {formatPrice(item.totalAmount)}
                  </p>
                  <div className="pt-1">
                    <ClientPlanStatusBadge
                      status={clientPlanStatus(item, today)}
                    />
                  </div>
                </div>
                {planButton(item, true)}
              </li>
            ))
      }
      rows={
        recurrences
          ? recurrences.map((item) => (
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
                  {period(item)}
                </td>
                <td className="px-4 py-3">
                  <RecurrenceStatusBadge active={item.isActive} />
                </td>
                <td className="px-4 py-2 text-right">
                  {sessionsButton(item, false)}
                </td>
              </tr>
            ))
          : clientPlans?.map((item) => (
              <tr key={item.id} className="hover:bg-background">
                <td className="px-4 py-3 font-medium">{item.plan.name}</td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {period(item)}
                </td>
                <td className="px-4 py-3">{BILLING_LABEL[item.billingType]}</td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {formatPrice(item.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <ClientPlanStatusBadge
                    status={clientPlanStatus(item, today)}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  {planButton(item, false)}
                </td>
              </tr>
            ))
      }
      footer={footer}
    >
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
    </ListCard>
  );
}
