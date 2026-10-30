"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateAppointmentAction } from "@/app/(admin)/appointment-actions";
import {
  getRecurrenceAction,
  rescheduleRecurrenceSessionAction,
} from "@/app/(admin)/recurrence-actions";
import { RescheduleSessionDialog } from "@/components/recurrences/RescheduleSessionDialog";
import type { AgendaAppointment } from "@/types/agenda";
import type { RecurrenceItem } from "@/types/recurrence";

type RescheduleAppointmentDialogProps = {
  /** Agendamento a remanejar; nulo = nada aberto. */
  appointment: AgendaAppointment | null;
  /** Dia da agenda, "aaaa-mm-dd", e hoje no fuso da empresa. */
  date: string;
  today: string;
  onClose: () => void;
};

/**
 * Remanejar pela agenda. Agendamento comum vai pela rota de alteração. Sessão de
 * recorrência vai pela rota da recorrência, e a agenda não conhece o período
 * dela: ele é buscado ao abrir.
 */
export function RescheduleAppointmentDialog({
  appointment,
  date,
  today,
  onClose,
}: RescheduleAppointmentDialogProps) {
  const recurrenceId = appointment?.recurrence?.id;
  // O resultado guarda o id a que se refere: outro id = ainda carregando.
  const [loaded, setLoaded] = useState<{ id: string; item: RecurrenceItem }>();

  useEffect(() => {
    if (!recurrenceId) return;

    let cancelled = false;
    getRecurrenceAction(recurrenceId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setLoaded({ id: recurrenceId, item: result.recurrence });
        return;
      }
      toast.error("Não foi possível abrir o remanejamento.", {
        description: result.message,
      });
      onClose();
    });
    return () => {
      cancelled = true;
    };
  }, [recurrenceId, onClose]);

  if (!appointment) return null;
  const recurrence =
    recurrenceId && loaded?.id === recurrenceId ? loaded.item : null;
  // Sessão de recorrência: espera o período chegar.
  if (recurrenceId && !recurrence) return null;

  return (
    <RescheduleSessionDialog
      session={{ id: appointment.id, date, time: appointment.start }}
      professional={{
        id: appointment.professionalId,
        name: appointment.professionalName,
      }}
      clientName={appointment.clientName}
      duration={appointment.durationMinutes}
      period={
        recurrence
          ? { start: recurrence.startDate, end: recurrence.endDate }
          : undefined
      }
      today={today}
      inClass={appointment.classSession !== null}
      onSubmit={(newDate, time) =>
        recurrence
          ? rescheduleRecurrenceSessionAction(
              recurrence.id,
              appointment.id,
              newDate,
              time,
            )
          : updateAppointmentAction({
              id: appointment.id,
              date: newDate,
              time,
            })
      }
      onOpenChange={(open) => !open && onClose()}
    />
  );
}
