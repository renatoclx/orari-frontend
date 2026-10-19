"use client";

import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { getClientPlanSummaryAction } from "@/app/(admin)/client-plan-actions";
import { clientPlanStatus } from "@/components/client-plans/client-plan-status";
import {
  ClientPlanInfo,
  ClientPlanPayments,
  ClientPlanSchedules,
} from "@/components/client-plans/ClientPlanParts";
import { ClientPlanStatusBadge } from "@/components/client-plans/ClientPlanStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClientPlanItem } from "@/types/client-plan";
import type { PaymentItem } from "@/types/payment";

type ClientPlanDialogProps = {
  /** Contratação aberta; nula = fechado. */
  clientPlanId: string | null;
  /** Hoje no fuso da empresa (situação da contratação). */
  today: string;
  /** "Ver sessões" de uma agenda: quem abriu troca este diálogo pelo de sessões. */
  onViewSessions: (recurrenceId: string) => void;
  onOpenChange: (open: boolean) => void;
};

type Loaded = {
  key: string;
  item?: ClientPlanItem;
  payments?: PaymentItem[];
  failed?: boolean;
};

/**
 * Resumo da contratação sem sair da agenda: dados, valores, agendas e parcelas.
 * O cancelamento continua na página da contratação.
 */
export function ClientPlanDialog({
  clientPlanId,
  today,
  onViewSessions,
  onOpenChange,
}: ClientPlanDialogProps) {
  // A versão sobe em "Tentar de novo".
  const [version, setVersion] = useState(0);
  const key = clientPlanId ? `${clientPlanId}|${version}` : "";
  // O resultado guarda a chave a que se refere: outra chave = carregando.
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!clientPlanId) return;
    let cancelled = false;
    getClientPlanSummaryAction(clientPlanId)
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          toast.error("Não foi possível buscar a contratação.", {
            description: result.message,
          });
          setLoaded({ key, failed: true });
          return;
        }
        setLoaded({ key, item: result.item, payments: result.payments });
      })
      // Falha inesperada (ex.: servidor reiniciado): não fica carregando.
      .catch(() => {
        if (!cancelled) setLoaded({ key, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [clientPlanId, key]);

  const current = loaded?.key === key ? loaded : undefined;
  const item = current?.item;

  return (
    <Dialog open={clientPlanId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {item ? item.plan.name : "Contratação"}
            {item && (
              <ClientPlanStatusBadge status={clientPlanStatus(item, today)} />
            )}
          </DialogTitle>
          <DialogDescription>
            {item
              ? `Contratação de ${item.client.name}.`
              : "Dados, agendas e parcelas da contratação."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto">
          {current?.failed ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-muted-foreground">
              Não foi possível buscar a contratação.
              <Button
                variant="outline"
                onClick={() => setVersion((value) => value + 1)}
              >
                <RotateCcw aria-hidden="true" />
                Tentar de novo
              </Button>
            </div>
          ) : item && current?.payments ? (
            <>
              <ClientPlanInfo item={item} />
              <section className="rounded-control border border-border">
                <h3 className="border-b border-border px-4 py-2 text-sm font-semibold">
                  Agendas
                </h3>
                <ClientPlanSchedules
                  item={item}
                  onViewSessions={onViewSessions}
                />
              </section>
              <section className="rounded-control border border-border">
                <h3 className="border-b border-border px-4 py-2 text-sm font-semibold">
                  Parcelas
                </h3>
                <ClientPlanPayments payments={current.payments} />
              </section>
            </>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Buscando a contratação…
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X aria-hidden="true" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
