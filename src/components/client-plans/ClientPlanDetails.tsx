"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { cancelClientPlanAction } from "@/app/(admin)/client-plan-actions";
import { clientPlanStatus } from "@/components/client-plans/client-plan-status";
import { CancelClientPlanDialog } from "@/components/client-plans/CancelClientPlanDialog";
import { RecurrenceSessionsDialog } from "@/components/recurrences/RecurrenceSessionsDialog";
import { useAgendaClock } from "@/components/agenda/useAgendaClock";
import {
  ClientPlanInfo,
  ClientPlanPayments,
  ClientPlanSchedules,
} from "@/components/client-plans/ClientPlanParts";
import { ClientPlanStatusBadge } from "@/components/client-plans/ClientPlanStatusBadge";
import { Button } from "@/components/ui/button";
import type { ClientPlanItem } from "@/types/client-plan";
import type { PaymentItem } from "@/types/payment";

type ClientPlanDetailsProps = {
  item: ClientPlanItem;
  payments: PaymentItem[];
  timeZone: string;
  /** Instante em que o servidor montou a página (primeiro desenho do relógio). */
  serverNow: number;
};

/** Detalhes da contratação: dados, valores, agendas, parcelas e cancelamento. */
export function ClientPlanDetails({
  item,
  payments,
  timeZone,
  serverNow,
}: ClientPlanDetailsProps) {
  // Relógio da tela: a situação e o que ainda pode mudar acompanham o tempo.
  const { today, nowTime } = useAgendaClock(timeZone, serverNow);
  const [viewing, setViewing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [pending, startTransition] = useTransition();
  const status = clientPlanStatus(item, today);

  function confirmCancel() {
    startTransition(async () => {
      const result = await cancelClientPlanAction(item.id);
      if (result.ok) {
        toast.success("Contratação cancelada.", {
          description: `${item.client.name} · ${item.plan.name}`,
        });
        setCancelling(false);
      } else {
        toast.error("Não foi possível cancelar a contratação.", {
          description: result.message,
        });
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      <section className="rounded-card border border-border bg-card p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">Dados da contratação</h2>
            <ClientPlanStatusBadge status={status} />
          </div>
          {status === "active" && (
            <Button variant="destructive" onClick={() => setCancelling(true)}>
              <Ban aria-hidden="true" />
              Cancelar contratação
            </Button>
          )}
        </div>
        <div className="mt-4">
          <ClientPlanInfo item={item} />
        </div>
      </section>

      <section className="rounded-card border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 font-semibold md:px-6">
          Agendas
        </h2>
        <ClientPlanSchedules item={item} onViewSessions={setViewing} />
      </section>

      <section className="rounded-card border border-border bg-card">
        <div className="border-b border-border px-4 py-3 md:px-6">
          <h2 className="font-semibold">Parcelas</h2>
          <p className="text-sm text-muted-foreground">
            A baixa dos pagamentos é feita no Financeiro.
          </p>
        </div>
        <ClientPlanPayments payments={payments} />
      </section>

      <RecurrenceSessionsDialog
        recurrenceId={viewing}
        timeZone={timeZone}
        today={today}
        nowTime={nowTime}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <CancelClientPlanDialog
        item={cancelling ? item : null}
        pending={pending}
        onOpenChange={setCancelling}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
