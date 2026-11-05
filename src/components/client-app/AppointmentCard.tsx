"use client";

import { useState, useTransition } from "react";
import { Ban, CalendarClock, X } from "lucide-react";
import { appCancelAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import {
  cannotCancelReason,
  kindLabel,
  pastStatusLabel,
} from "@/components/client-app/appointments-list";
import { appointmentWhen } from "@/components/client-app/client-app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppAppointment } from "@/types/client-app";

/**
 * Um agendamento na aba Agendamentos (screens/app-cliente.md). Nos próximos,
 * Cancelar pede confirmação no próprio cartão: as janelas de diálogo da
 * clínica ficam fora da área escura do app.
 */
export function AppointmentCard({
  item,
  upcoming,
}: {
  item: AppAppointment;
  upcoming: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const status = upcoming ? undefined : pastStatusLabel(item.status);
  const kind = kindLabel(item.kind);
  const reason = upcoming ? cannotCancelReason(item) : undefined;

  function cancel() {
    startTransition(async () => {
      const result = await appCancelAction(item.place.slug, item.id);
      if (!result.ok) setError(result.message);
      // Cancelado: a página é recarregada (revalidatePath) e o cartão some.
    });
  }

  return (
    <li className="space-y-2 rounded-card border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <CalendarClock
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{item.service.name}</p>
            {kind && <Badge variant="secondary">{kind}</Badge>}
            {status && (
              <Badge
                variant={
                  item.status === "COMPLETED"
                    ? "success"
                    : item.status === "CANCELLED"
                      ? "secondary"
                      : "destructive"
                }
              >
                {status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {appointmentWhen(item.startAt, item.place.timezone)} ·{" "}
            {item.professional.name}
          </p>
          <p className="text-muted-foreground">{item.place.name}</p>
        </div>
      </div>

      {error && <AppFormMessage>{error}</AppFormMessage>}

      {upcoming &&
        (reason ? (
          <p className="text-xs text-muted-foreground">{reason}</p>
        ) : confirming ? (
          <div className="space-y-2 rounded-control border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm">Cancelar este agendamento?</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                disabled={pending}
                onClick={() => setConfirming(false)}
              >
                <X aria-hidden="true" />
                Manter
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-11 flex-1"
                disabled={pending}
                onClick={cancel}
              >
                <Ban aria-hidden="true" />
                {pending ? "Cancelando…" : "Cancelar"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-10 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setError(undefined);
              setConfirming(true);
            }}
          >
            <Ban aria-hidden="true" />
            Cancelar
          </Button>
        ))}
    </li>
  );
}
