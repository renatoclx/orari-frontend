"use client";

import { CalendarSync, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getAvailabilityAction,
  type Availability,
} from "@/app/(admin)/appointment-actions";
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
import { timeToMinutes } from "@/utils/time";

/** O que o diálogo precisa saber da sessão: o id e quando ela está marcada. */
export type ReschedulableSession = {
  id: string;
  /** "aaaa-mm-dd" */
  date: string;
  /** "HH:mm" */
  time: string;
};

type RescheduleSessionDialogProps = {
  /** Agendamento ou sessão a remanejar, com dia e horário no fuso da empresa; nulo = dialog fechado. */
  session: ReschedulableSession | null;
  professional: { id: string; name: string };
  clientName: string;
  /** Duração do serviço, em minutos. */
  duration: number;
  /** Sessão de recorrência: só se remaneja dentro do período ("aaaa-mm-dd"). */
  period?: { start: string; end: string };
  today: string;
  /** Reposição de sessão de pacote após falta: só muda os textos (o fluxo é o mesmo). */
  replacement?: boolean;
  /** Grava o novo dia e horário (a recorrência e o agendamento comum usam rotas diferentes). */
  onSubmit: (
    date: string,
    time: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  onOpenChange: (open: boolean) => void;
};

const parseDay = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Remanejamento de um agendamento (comum ou sessão de recorrência): nova data e
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
  session,
  professional,
  clientName,
  duration,
  period,
  today,
  replacement,
  onSubmit,
  onOpenChange,
}: RescheduleSessionDialogProps & { session: ReschedulableSession }) {
  const original = session.date;
  const [day, setDay] = useState(original < today ? today : original);
  const [time, setTime] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Disponibilidade do profissional no dia; o resultado guarda a chave a que se
  // refere, e outra chave significa que ainda está carregando.
  const key = `${professional.id}|${day}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    availability?: Availability;
  }>();

  useEffect(() => {
    let cancelled = false;
    // O próprio agendamento não ocupa horário para ele mesmo.
    getAvailabilityAction(professional.id, day, session.id).then((result) => {
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
  }, [professional.id, session.id, day, key]);

  const loading = loaded?.key !== key;
  const availability = loading ? undefined : loaded?.availability;
  const starts = availability
    ? availableStarts({
        windows: availability.windows,
        busy: availability.busy,
        duration,
        notBefore: availability.notBefore,
      })
    : [];
  const currentTime = time && starts.includes(timeToMinutes(time)) ? time : "";

  const unchanged = day === original && currentTime === session.time;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentTime) {
      setError("Selecione o horário.");
      document.getElementById("reschedule-time")?.focus();
      return;
    }

    startTransition(async () => {
      const result = await onSubmit(day, currentTime);
      if (result.ok) {
        toast.success(
          replacement
            ? "Sessão reposta."
            : period
              ? "Sessão remanejada."
              : "Agendamento remanejado.",
        );
        onOpenChange(false);
        return;
      }
      setError(result.message);
      toast.error(
        replacement
          ? "Não foi possível repor a sessão."
          : "Não foi possível remanejar.",
        {
          description: result.message,
        },
      );
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
        <DialogTitle>
          {replacement
            ? "Repor sessão"
            : period
              ? "Remanejar sessão"
              : "Remanejar agendamento"}
        </DialogTitle>
        <DialogDescription>
          {replacement
            ? `Escolha o novo dia e horário da sessão que ${clientName} perdeu, com ${professional.name}, dentro do período da contratação. A sessão volta a Agendado.`
            : `Escolha a nova data e o horário de ${clientName} com ${professional.name}${period ? ", dentro do período da recorrência." : "."}`}
        </DialogDescription>
      </DialogHeader>

      <FormField id="reschedule-date" label="Data" required>
        <DatePicker
          id="reschedule-date"
          name="date"
          initialValue={day}
          minDate={parseDay(
            period && period.start > today ? period.start : today,
          )}
          maxDate={period ? parseDay(period.end) : undefined}
          onValueChange={(next) => {
            setDay(next);
            setError(undefined);
          }}
        />
      </FormField>

      <FormField id="reschedule-time" label="Horário" required error={error}>
        {hint ? (
          <p
            role="status"
            className="rounded-control border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
          >
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
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending || unchanged}>
          <CalendarSync aria-hidden="true" />
          {pending ? "Salvando…" : replacement ? "Repor" : "Remanejar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
