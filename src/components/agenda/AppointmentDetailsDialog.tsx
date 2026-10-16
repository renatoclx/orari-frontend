"use client";

import {
  CalendarClock,
  Clock,
  Pencil,
  StickyNote,
  UserRound,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelAppointmentAction } from "@/app/(admin)/appointment-actions";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AgendaAppointment } from "@/types/agenda";
import { formatDuration } from "@/utils/format";

type AppointmentDetailsDialogProps = {
  appointment: AgendaAppointment | null;
  /** O agendamento pode ser cancelado: ainda não começou e não está encerrado. */
  canCancel: (appointment: AgendaAppointment) => boolean;
  onOpenChange: (open: boolean) => void;
};

// Detalhes do agendamento. A única ação de status é cancelar: início e fim são
// automáticos (o backend muda o status pelo horário) e a confirmação virá do
// cliente. "Alterar" ainda é rascunho.
export function AppointmentDetailsDialog({
  appointment,
  canCancel,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  return (
    <Dialog open={appointment !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {appointment && (
          <Details
            appointment={appointment}
            cancellable={canCancel(appointment)}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Details({
  appointment,
  cancellable,
  onClose,
}: {
  appointment: AgendaAppointment;
  cancellable: boolean;
  onClose: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const { label: statusLabel, icon: StatusIcon } =
    APPOINTMENT_STATUS[appointment.status];

  function draft(action: string) {
    toast.info(`Rascunho de tela: "${action}" ainda não grava.`);
    onClose();
  }

  function cancel() {
    startTransition(async () => {
      const result = await cancelAppointmentAction(appointment.id);
      if (result.ok) {
        toast.success("Agendamento cancelado.", {
          description: `${appointment.clientName}, ${appointment.start} às ${appointment.end}`,
        });
        setConfirmOpen(false);
        onClose();
      } else {
        toast.error("Não foi possível cancelar o agendamento.", {
          description: result.message,
        });
      }
    });
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <PersonAvatar
            name={appointment.clientName}
            photoUrl={appointment.clientPhotoUrl}
            size="lg"
          />
          <div className="min-w-0">
            <DialogTitle className="truncate">
              {appointment.clientName}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: appointment.serviceColor }}
                aria-hidden="true"
              />
              {appointment.serviceName} ·{" "}
              {formatDuration(appointment.durationMinutes)}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Clock
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="tabular-nums">
            {appointment.start} às {appointment.end}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <UserRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          com {appointment.professionalName}
        </li>
        <li className="flex items-center gap-2">
          <StatusIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {statusLabel}
        </li>
        {appointment.overbooking && (
          <li className="flex items-center gap-2 font-medium">
            <CalendarClock
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            Encaixe fora do horário de funcionamento
          </li>
        )}
        {appointment.note && (
          <li className="flex items-start gap-2">
            <StickyNote
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {appointment.note}
          </li>
        )}
      </ul>

      {cancellable && (
        <div className="flex justify-center border-t border-border pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            Cancelar agendamento
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancelar agendamento?"
        description={`O agendamento de ${appointment.clientName}, das ${appointment.start} às ${appointment.end}, será cancelado e o horário ficará livre.`}
        confirmLabel="Cancelar agendamento"
        pendingLabel="Cancelando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        onConfirm={cancel}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button type="button" onClick={() => draft("Alterar agendamento")}>
          <Pencil aria-hidden="true" />
          Alterar
        </Button>
      </DialogFooter>
    </>
  );
}
