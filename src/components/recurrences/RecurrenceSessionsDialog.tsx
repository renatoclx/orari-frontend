"use client";

import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import {
  getRecurrenceAction,
  listRecurrenceSessionsAction,
} from "@/app/(admin)/recurrence-actions";
import { describeDays } from "@/components/recurrences/recurrence-schedule";
import { RecurrenceSessions } from "@/components/recurrences/RecurrenceSessions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RecurrenceItem, RecurrenceSession } from "@/types/recurrence";

type RecurrenceSessionsDialogProps = {
  /** Recorrência aberta (avulsa ou agenda de pacote); nula = fechado. */
  recurrenceId: string | null;
  timeZone: string;
  /** Relógio da tela que abriu o diálogo (useAgendaClock). */
  today: string;
  nowTime: string;
  onOpenChange: (open: boolean) => void;
};

type Loaded = {
  key: string;
  recurrence?: RecurrenceItem;
  sessions?: RecurrenceSession[];
  failed?: boolean;
};

/**
 * Sessões de uma recorrência sem sair da tela (contratação e agenda), com as
 * mesmas ações da tela da recorrência: remanejar e cancelar sessão.
 */
export function RecurrenceSessionsDialog({
  recurrenceId,
  timeZone,
  today,
  nowTime,
  onOpenChange,
}: RecurrenceSessionsDialogProps) {
  // A versão sobe depois de cancelar ou remanejar, para buscar de novo.
  const [version, setVersion] = useState(0);
  const key = recurrenceId ? `${recurrenceId}|${version}` : "";
  // O resultado guarda a chave a que se refere: outra chave = carregando.
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!recurrenceId) return;
    let cancelled = false;
    Promise.all([
      getRecurrenceAction(recurrenceId),
      listRecurrenceSessionsAction(recurrenceId),
    ])
      .then(([recurrence, sessions]) => {
        if (cancelled) return;
        if (!recurrence.ok || !sessions.ok) {
          toast.error("Não foi possível buscar as sessões.", {
            description: !recurrence.ok
              ? recurrence.message
              : !sessions.ok
                ? sessions.message
                : undefined,
          });
          setLoaded({ key, failed: true });
          return;
        }
        setLoaded({
          key,
          recurrence: recurrence.recurrence,
          sessions: sessions.sessions,
        });
      })
      // Falha inesperada (ex.: servidor reiniciado): sem isso, a tela ficaria
      // "buscando" para sempre.
      .catch(() => {
        if (!cancelled) setLoaded({ key, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [recurrenceId, key]);

  const current = loaded?.key === key ? loaded : undefined;
  const recurrence = current?.recurrence;

  return (
    <Dialog open={recurrenceId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {recurrence
              ? `${recurrence.service.name} · ${current?.sessions?.length ?? 0} sessões`
              : "Sessões"}
          </DialogTitle>
          <DialogDescription>
            {recurrence
              ? `${recurrence.client.name} com ${recurrence.professional.name} · ${describeDays(recurrence.days)}`
              : "Sessões geradas pela recorrência."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto rounded-control border border-border">
          {current?.failed ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-muted-foreground">
              Não foi possível buscar as sessões.
              <Button
                variant="outline"
                onClick={() => setVersion((value) => value + 1)}
              >
                <RotateCcw aria-hidden="true" />
                Tentar de novo
              </Button>
            </div>
          ) : recurrence && current?.sessions ? (
            <RecurrenceSessions
              recurrenceId={recurrence.id}
              sessions={current.sessions}
              active={recurrence.isActive}
              timeZone={timeZone}
              today={today}
              nowTime={nowTime}
              professional={recurrence.professional}
              clientName={recurrence.client.name}
              duration={recurrence.service.duration}
              period={{ start: recurrence.startDate, end: recurrence.endDate }}
              onChanged={() => setVersion((value) => value + 1)}
            />
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Buscando sessões…
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
