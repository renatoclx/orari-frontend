"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAvailabilityAction,
  type Availability,
} from "@/app/(admin)/appointment-actions";
import { availableStarts } from "@/components/agenda/agenda-availability";
import { AvailableTimes } from "@/components/agenda/AvailableTimes";
import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import { Switch } from "@/components/ui/switch";
import type { WeekDay } from "@/types/business-hour";
import { shiftDateString, weekDayOf } from "@/utils/time";
import { cn } from "cn";

/** Horário inicial de cada dia marcado ("" = ainda sem horário). */
export type DayTimes = Partial<Record<WeekDay, string>>;

type RecurrenceDaysFieldProps = {
  value: DayTimes;
  onChange: (value: DayTimes) => void;
  invalid?: boolean;
  /** Sem profissional, serviço ou data inicial, não há horários para mostrar. */
  professionalId: string;
  /** Duração do serviço, em minutos (0 = serviço não escolhido). */
  duration: number;
  /** Data inicial, "aaaa-mm-dd". */
  startDate: string;
};

/**
 * Dias da semana da recorrência: marca o dia e escolhe o horário inicial na
 * mesma linha, com o período e os horários livres (como no novo agendamento).
 */
export function RecurrenceDaysField({
  value,
  onChange,
  invalid,
  professionalId,
  duration,
  startDate,
}: RecurrenceDaysFieldProps) {
  function toggle(day: WeekDay, on: boolean) {
    const next = { ...value };
    if (on) next[day] = "";
    else delete next[day];
    onChange(next);
  }

  return (
    <ul
      id="recurrence-days"
      tabIndex={-1}
      className={cn(
        "divide-y divide-border rounded-control border border-border",
        invalid && "border-destructive",
      )}
    >
      {WEEK_DAYS.map((day) => {
        const on = day.id in value;
        return (
          <li
            key={day.id}
            className="flex flex-col gap-3 px-3 py-2 md:flex-row md:items-start"
          >
            <label className="flex min-h-10 items-center gap-3 md:w-48 md:shrink-0">
              <Switch
                checked={on}
                onCheckedChange={(checked) => toggle(day.id, checked)}
              />
              <span className="text-sm">{day.long}</span>
            </label>
            {on && (
              <div className="min-w-0 flex-1">
                <DayTimeChoice
                  weekDay={day.id}
                  value={value[day.id] ?? ""}
                  onChange={(time) => onChange({ ...value, [day.id]: time })}
                  professionalId={professionalId}
                  duration={duration}
                  startDate={startDate}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type DayTimeChoiceProps = {
  weekDay: WeekDay;
  value: string;
  onChange: (time: string) => void;
  professionalId: string;
  duration: number;
  startDate: string;
};

// Primeira data, a partir da inicial, que cai no dia da semana.
function firstDateOn(startDate: string, weekDay: WeekDay): string {
  let date = startDate;
  for (let i = 0; i < 7 && weekDayOf(date) !== weekDay; i++) {
    date = shiftDateString(date, 1);
  }
  return date;
}

// Horários livres do profissional no dia da semana. A disponibilidade é a da
// primeira ocorrência do período; as demais são conferidas ao cadastrar (o
// servidor recusa tudo se alguma não couber).
function DayTimeChoice({
  weekDay,
  value,
  onChange,
  professionalId,
  duration,
  startDate,
}: DayTimeChoiceProps) {
  const ready = Boolean(professionalId && duration > 0 && startDate);
  const date = ready ? firstDateOn(startDate, weekDay) : "";

  // O resultado guarda a chave a que se refere: outra chave = ainda carregando.
  const key = `${professionalId}|${date}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    availability?: Availability;
  }>();

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    getAvailabilityAction(professionalId, date).then((result) => {
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
  }, [ready, professionalId, date, key]);

  if (!ready) {
    return <Hint>Selecione o profissional, o serviço e a data inicial.</Hint>;
  }
  if (loaded?.key !== key) return <Hint>Buscando horários…</Hint>;

  const starts = loaded.availability
    ? availableStarts({
        windows: loaded.availability.windows,
        busy: loaded.availability.busy,
        duration,
        notBefore: loaded.availability.notBefore,
      })
    : [];
  if (starts.length === 0) {
    return <Hint>Sem horários disponíveis neste dia da semana.</Hint>;
  }

  return (
    <AvailableTimes
      id={`recurrence-time-${weekDay}`}
      starts={starts}
      value={value}
      onChange={onChange}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex min-h-10 items-center rounded-control border border-dashed border-border px-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
