"use client";

import {
  CalendarClock,
  CalendarSync,
  ClipboardList,
  Clock,
  ListChecks,
  Package,
  Pencil,
  StickyNote,
  UserRound,
  UserX,
  UsersRound,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useCanAccessAnamnesis } from "@/components/anamnesis/AnamnesisAccessProvider";
import {
  cancelAppointmentAction,
  markNoShowAction,
} from "@/app/(admin)/appointment-actions";
import { cancelRecurrenceSessionAction } from "@/app/(admin)/recurrence-actions";
import {
  APPOINTMENT_STATUS,
  CANCEL_REASON_LABEL,
} from "@/components/agenda/appointment-status";
import {
  RecurrenceOriginIcon,
  recurrenceLabel,
} from "@/components/agenda/recurrence-label";
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
  /** Pode ser cancelado ou alterado: ainda não começou e não está encerrado. */
  canCancel: (appointment: AgendaAppointment) => boolean;
  /** Pode ter a falta marcada: já iniciou (ver `canMarkNoShow`). */
  canMarkNoShow: (appointment: AgendaAppointment) => boolean;
  /**
   * Pode virar turma: ainda não começou, é de serviço que aceita turma e não é
   * de turma. Só a agenda oferece; nas outras telas fica de fora.
   */
  canConvertToClass?: (appointment: AgendaAppointment) => boolean;
  /** Abre o "Transformar em turma" (pede as vagas). */
  onConvertToClass?: (appointment: AgendaAppointment) => void;
  /** Abre o dialog de alteração do agendamento. */
  onEdit: (appointment: AgendaAppointment) => void;
  /** Abre o remanejamento (agendamento comum ou sessão de recorrência). */
  onReschedule: (appointment: AgendaAppointment) => void;
  /** Abre as sessões da recorrência (ou do pacote) em diálogo. */
  onViewSessions: (recurrenceId: string) => void;
  /** Abre o resumo da contratação (sessão de pacote) em diálogo. */
  onViewClientPlan: (clientPlanId: string) => void;
  onOpenChange: (open: boolean) => void;
};

// Detalhes do agendamento. As ações de status são cancelar (antes de iniciar) e
// marcar a falta (depois): início e fim são automáticos (o backend muda o status
// pelo horário) e a confirmação virá do
// cliente. "Alterar" abre o dialog de alteração, só antes de o agendamento iniciar.
export function AppointmentDetailsDialog({
  appointment,
  canCancel,
  canMarkNoShow,
  canConvertToClass,
  onConvertToClass,
  onEdit,
  onReschedule,
  onViewSessions,
  onViewClientPlan,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  const canAccessAnamnesis = useCanAccessAnamnesis();
  // Botões do rodapé: o atalho da anamnese e as ações do agendamento.
  const footerButtons = appointment
    ? (canAccessAnamnesis ? 1 : 0) +
      (appointment.recurrence
        ? 1 + (appointment.recurrence.clientPlanId ? 1 : 0)
        : canCancel(appointment)
          ? 1
          : 0)
    : 0;

  return (
    <Dialog open={appointment !== null} onOpenChange={onOpenChange}>
      {/* Mais botões no rodapé pedem mais largura (os botões não cabiam). */}
      <DialogContent
        className={footerButtons >= 3 ? "sm:max-w-xl" : "sm:max-w-md"}
      >
        {appointment && (
          <Details
            appointment={appointment}
            cancellable={canCancel(appointment)}
            markable={canMarkNoShow(appointment)}
            convertible={canConvertToClass?.(appointment) ?? false}
            onConvertToClass={() => onConvertToClass?.(appointment)}
            onEdit={() => onEdit(appointment)}
            onReschedule={() => onReschedule(appointment)}
            onViewSessions={() =>
              appointment.recurrence &&
              onViewSessions(appointment.recurrence.id)
            }
            onViewClientPlan={() =>
              appointment.recurrence?.clientPlanId &&
              onViewClientPlan(appointment.recurrence.clientPlanId)
            }
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
  markable,
  convertible,
  onConvertToClass,
  onEdit,
  onReschedule,
  onViewSessions,
  onViewClientPlan,
  onClose,
}: {
  appointment: AgendaAppointment;
  cancellable: boolean;
  markable: boolean;
  convertible: boolean;
  onConvertToClass: () => void;
  onEdit: () => void;
  onReschedule: () => void;
  onViewSessions: () => void;
  onViewClientPlan: () => void;
  onClose: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const canAccessAnamnesis = useCanAccessAnamnesis();

  const { label: statusLabel, icon: StatusIcon } =
    APPOINTMENT_STATUS[appointment.status];

  function cancel() {
    startTransition(async () => {
      // Agendamento de recorrência só é cancelado pela rota da recorrência.
      const result = appointment.recurrence
        ? await cancelRecurrenceSessionAction(
            appointment.recurrence.id,
            appointment.id,
          )
        : await cancelAppointmentAction(appointment.id);
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

  // Sessão de pacote: a falta pode ser reposta em outra data, então não é "definitiva".
  const isPackage = Boolean(appointment.recurrence?.clientPlanId);

  function markNoShow() {
    startTransition(async () => {
      const result = await markNoShowAction(appointment.id);
      if (result.ok) {
        toast.success("Falta registrada.", {
          description: `${appointment.clientName}, ${appointment.start} às ${appointment.end}`,
        });
        setNoShowOpen(false);
        onClose();
      } else {
        toast.error("Não foi possível marcar a falta.", {
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
          {/* Aula de turma cancelada pela clínica: o porquê, ao lado. */}
          {appointment.cancelReason &&
            ` · ${CANCEL_REASON_LABEL[appointment.cancelReason]}`}
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
        {appointment.recurrence && (
          <li className="flex items-center gap-2">
            <RecurrenceOriginIcon
              recurrence={appointment.recurrence}
              className="size-4 shrink-0 text-muted-foreground"
            />
            {recurrenceLabel(appointment.recurrence)}
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
        <div className="flex justify-center gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Ban aria-hidden="true" />
            Cancelar
          </Button>
          {/* O cliente pode pedir outro dia em vez de cancelar. O encaixe tem
              regras próprias de horário: é remanejado pelo "Alterar". O aluno
              avulso de turma segue o horário da sessão (a API não o remaneja);
              a aula de recorrência ou plano em turma, sim: sai da sessão. */}
          {!appointment.overbooking &&
            (!appointment.classSession || appointment.recurrence) && (
              <Button type="button" onClick={onReschedule}>
                <CalendarSync aria-hidden="true" />
                Remanejar
              </Button>
            )}
        </div>
      )}

      {/* Serviço que aceita turma: o atendimento pode receber outros clientes. */}
      {convertible && (
        <div className="flex justify-center border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="max-sm:w-full"
            onClick={onConvertToClass}
          >
            <UsersRound aria-hidden="true" />
            Transformar em turma
          </Button>
        </div>
      )}

      {/* Atendimento que já iniciou: não há o que cancelar ou remanejar, e a
          recepção anota a falta. Não cobra (o pagamento pendente é cancelado). */}
      {markable && (
        <div className="flex justify-center border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="max-sm:w-full"
            onClick={() => setNoShowOpen(true)}
          >
            <UserX aria-hidden="true" />
            Marcar falta
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={noShowOpen}
        onOpenChange={setNoShowOpen}
        title="Marcar falta?"
        description={
          `${appointment.clientName} não compareceu ao atendimento das ${appointment.start} às ${appointment.end}. ` +
          (isPackage
            ? "A sessão poderá ser reposta em outra data, em Ver sessões."
            : "O pagamento pendente será cancelado e a falta não poderá ser desfeita.")
        }
        confirmLabel="Marcar falta"
        icon={UserX}
        pendingLabel="Marcando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        onConfirm={markNoShow}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancelar agendamento?"
        description={`O agendamento de ${appointment.clientName}, das ${appointment.start} às ${appointment.end}, será cancelado e o horário ficará livre.`}
        confirmLabel="Cancelar agendamento"
        icon={Ban}
        pendingLabel="Cancelando…"
        cancelLabel="Voltar"
        pending={pending}
        destructive
        onConfirm={cancel}
      />

      {/* Sem botões, sem rodapé (o dialog fecha pelo X do canto). */}
      {(canAccessAnamnesis || appointment.recurrence || cancellable) && (
        <DialogFooter className="sm:flex-nowrap sm:justify-center">
          {/* Atalho para as fichas do cliente (só com acesso à anamnese). */}
          {canAccessAnamnesis && (
            <Button asChild variant="outline">
              <Link href={`/clientes/${appointment.clientId}?aba=anamnese`}>
                <ClipboardList aria-hidden="true" />
                Anamnese
              </Link>
            </Button>
          )}
          {/* Nada no passado é alterado: mesma condição do cancelamento. */}
          {appointment.recurrence ? (
            <>
              <Button type="button" variant="outline" onClick={onViewSessions}>
                <ListChecks aria-hidden="true" />
                Ver sessões
              </Button>
              {/* Sessão de pacote: o resumo da contratação, sem sair da agenda. */}
              {appointment.recurrence.clientPlanId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onViewClientPlan}
                >
                  <Package aria-hidden="true" />
                  Ver contratação
                </Button>
              )}
            </>
          ) : (
            cancellable && (
              <Button type="button" onClick={onEdit}>
                <Pencil aria-hidden="true" />
                Alterar
              </Button>
            )
          )}
        </DialogFooter>
      )}
    </>
  );
}
