"use client";

import { Clock, Pencil, StickyNote, UserRound } from "lucide-react";
import { toast } from "sonner";
import { APPOINTMENT_STATUS } from "@/components/agenda/appointment-status";
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
import type { AppointmentStatus } from "@/types/appointment";
import { formatDuration } from "@/utils/format";

type StatusAction = {
  label: string;
  /** Status que o agendamento passa a ter. */
  to: AppointmentStatus;
  destructive?: boolean;
};

// RASCUNHO: transições de status oferecidas em cada situação. É uma proposta
// para revisão (a API aceita qualquer status); as regras definitivas vêm do
// screens.md.
const STATUS_ACTIONS: Record<AppointmentStatus, StatusAction[]> = {
  SCHEDULED: [
    { label: "Confirmar", to: "CONFIRMED" },
    { label: "Cancelar agendamento", to: "CANCELLED", destructive: true },
  ],
  CONFIRMED: [
    { label: "Iniciar atendimento", to: "IN_PROGRESS" },
    { label: "Marcar como não compareceu", to: "NO_SHOW" },
    { label: "Cancelar agendamento", to: "CANCELLED", destructive: true },
  ],
  IN_PROGRESS: [{ label: "Concluir atendimento", to: "COMPLETED" }],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

type AppointmentDetailsDialogProps = {
  appointment: AgendaAppointment | null;
  onOpenChange: (open: boolean) => void;
};

// RASCUNHO VISUAL: detalhes do agendamento com as ações possíveis. As ações
// ainda não gravam nada.
export function AppointmentDetailsDialog({
  appointment,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  return (
    <Dialog open={appointment !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {appointment && (
          <Details
            appointment={appointment}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Details({
  appointment,
  onClose,
}: {
  appointment: AgendaAppointment;
  onClose: () => void;
}) {
  const { label: statusLabel, icon: StatusIcon } =
    APPOINTMENT_STATUS[appointment.status];
  const actions = STATUS_ACTIONS[appointment.status];

  function draft(action: string) {
    toast.info(`Rascunho de tela: "${action}" ainda não grava.`);
    onClose();
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

      {actions.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Alterar situação
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.to}
                type="button"
                variant="outline"
                className={
                  action.destructive
                    ? "text-destructive hover:text-destructive"
                    : undefined
                }
                onClick={() => draft(action.label)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

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
