"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getAvailabilityAction,
  type Availability,
} from "@/app/(admin)/appointment-actions";
import { rescheduleRecurrenceSessionAction } from "@/app/(admin)/recurrence-actions";
import { availableStarts } from "@/components/agenda/agenda-availability";
import { AvailableTimes } from "@/components/agenda/AvailableTimes";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
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
import { timeToMinutes, toDateString, toTimeString } from "@/utils/time";

type RescheduleSessionDialogProps = {
  recurrence: RecurrenceItem;
  /** Sessão a remanejar; nula = dialog fechado. */
  session: RecurrenceSession | null;
  timeZone: string;
  today: string;
  onOpenChange: (open: boolean) => void;
};

const parseDay = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Remanejamento de uma sessão: nova data (dentro do período da recorrência) e
 * horário livre do profissional; o fim é o início mais a duração do serviço.
 */
export function RescheduleSessionDialog(props: RescheduleSessionDialogProps) {
  return (
    <Dialog open={props.session !== null} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {props.session && <RescheduleForm {...props} session={props.session} />}
      </DialogContent>
    </Dialog>
  );
}

function RescheduleForm({
  recurrence,
  session,
  timeZone,
  today,
  onOpenChange,
}: RescheduleSessionDialogProps & { session: RecurrenceSession }) {
  const original = toDateString(new Date(session.startAt), timeZone);
  const [day, setDay] = useState(original < today ? today : original);
  const [time, setTime] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Disponibilidade do profissional no dia; o resultado guarda a chave a que se
  // refere, e outra chave significa que ainda está carregando.
  const key = `${recurrence.professional.id}|${day}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    availability?: Availability;
  }>();

  useEffect(() => {
    let cancelled = false;
    getAvailabilityAction(recurrence.professional.id, day).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        toast.error("Não foi possível buscar os horários.", {
          description: result.message,
        });
      }
      setLoaded({
        key,
        availability: result.ok ? result.availability : undefined,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [recurrence.professional.id, day, key]);

  const loading = loaded?.key !== key;
  const availability = loading ? undefined : loaded?.availability;
  const starts = availability
    ? availableStarts({
        windows: availability.windows,
        busy: availability.busy,
        duration: recurrence.service.duration,
        notBefore: availability.notBefore,
      })
    : [];
  const currentTime = time && starts.includes(timeToMinutes(time)) ? time : "";

  const currentStart = toTimeString(session.startAt, timeZone);
  const unchanged = day === original && currentTime === currentStart;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentTime) {
      setError("Selecione o horário.");
      document.getElementById("reschedule-time")?.focus();
      return;
    }

    startTransition(async () => {
      const result = await rescheduleRecurrenceSessionAction(
        recurrence.id,
        session.id,
        day,
        currentTime,
      );
      if (result.ok) {
        toast.success("Sessão remanejada.");
        onOpenChange(false);
        return;
      }
      setError(result.message);
      toast.error("Não foi possível remanejar a sessão.", {
        description: result.message,
      });
    });
  }

  const hint = loading
    ? "Buscando horários…"
    : starts.length === 0
      ? "Sem horários disponíveis neste dia. Tente outra data."
      : null;

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Remanejar sessão</DialogTitle>
        <DialogDescription>
          Escolha a nova data e o horário de {recurrence.client.name} com{" "}
          {recurrence.professional.name}, dentro do período da recorrência.
        </DialogDescription>
      </DialogHeader>

      <FormField id="reschedule-date" label="Data" required>
        <DatePicker
          id="reschedule-date"
          name="date"
          initialValue={day}
          minDate={parseDay(
            recurrence.startDate > today ? recurrence.startDate : today,
          )}
          maxDate={parseDay(recurrence.endDate)}
          onValueChange={(next) => {
            setDay(next);
            setError(undefined);
          }}
        />
      </FormField>

      <FormField id="reschedule-time" label="Horário" required error={error}>
        {hint ? (
          <p className="rounded-control border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
            {hint}
          </p>
        ) : (
          <AvailableTimes
            id="reschedule-time"
            starts={starts}
            value={currentTime}
            onChange={(next) => {
              setTime(next);
              setError(undefined);
            }}
            invalid={Boolean(error)}
          />
        )}
      </FormField>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending || unchanged}>
          {pending ? "Salvando…" : "Remanejar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
