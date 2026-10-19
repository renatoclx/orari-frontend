"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPeriodAvailabilityAction,
  type PeriodAvailability,
} from "@/app/(admin)/appointment-actions";
import { AvailableTimes } from "@/components/agenda/AvailableTimes";
import { periodStarts } from "@/components/agenda/period-availability";
import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import { Switch } from "@/components/ui/switch";
import type { TimeRange } from "@/types/agenda";
import type { WeekDay } from "@/types/business-hour";
import { cn } from "cn";

/** Horário inicial de cada dia marcado ("" = ainda sem horário). */
export type DayTimes = Partial<Record<WeekDay, string>>;

type RecurrenceDaysFieldProps = {
  /** Id da lista (foco em caso de erro); único na tela. */
  id: string;
  value: DayTimes;
  onChange: (value: DayTimes) => void;
  invalid?: boolean;
  /** Sem cliente, profissional, serviço ou período, não há horários para mostrar. */
  clientId: string;
  professionalId: string;
  /** Duração do serviço, em minutos (0 = serviço não escolhido). */
  duration: number;
  /** Período, "aaaa-mm-dd". */
  startDate: string;
  endDate: string;
  /**
   * Horários já ocupados pelo cliente em cada dia da semana nesta mesma tela
   * (sessões de outros serviços da contratação).
   */
  extraBusy?: Partial<Record<WeekDay, TimeRange[]>>;
  /**
   * Limite de dias (contratação: os atendimentos por semana do plano). Com o
   * limite atingido, os dias não marcados ficam desabilitados.
   */
  maxDays?: number;
};

/**
 * Dias da semana: marca o dia e escolhe o horário inicial na mesma linha, com o
 * período e os horários livres. Só aparece o horário livre em TODAS as datas
 * daquele dia da semana no período (profissional e cliente).
 */
export function RecurrenceDaysField({
  id,
  value,
  onChange,
  invalid,
  clientId,
  professionalId,
  duration,
  startDate,
  endDate,
  extraBusy = {},
  maxDays,
}: RecurrenceDaysFieldProps) {
  const full = maxDays !== undefined && Object.keys(value).length >= maxDays;
  const ready = Boolean(
    clientId &&
    professionalId &&
    duration > 0 &&
    startDate &&
    endDate &&
    endDate >= startDate,
  );

  // Uma busca para o período inteiro. O resultado guarda a chave a que se
  // refere: outra chave = ainda carregando.
  const key = `${clientId}|${professionalId}|${startDate}|${endDate}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    availability?: PeriodAvailability;
  }>();

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    getPeriodAvailabilityAction({
      professionalId,
      clientId,
      startDate,
      endDate,
    }).then((result) => {
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
  }, [ready, clientId, professionalId, startDate, endDate, key]);

  const availability =
    ready && loaded?.key === key ? loaded.availability : undefined;
  const hint = !ready
    ? "Selecione o cliente, o profissional, o serviço e o período."
    : loaded?.key !== key
      ? "Buscando horários…"
      : null;

  function toggle(day: WeekDay, on: boolean) {
    const next = { ...value };
    if (on) next[day] = "";
    else delete next[day];
    onChange(next);
  }

  return (
    <ul
      id={id}
      tabIndex={-1}
      className={cn(
        "divide-y divide-border rounded-control border border-border",
        invalid && "border-destructive",
      )}
    >
      {WEEK_DAYS.map((day) => {
        const on = day.id in value;
        const starts = availability
          ? periodStarts({
              availability,
              weekDay: day.id,
              startDate,
              endDate,
              duration,
              extraBusy: extraBusy[day.id],
            })
          : [];
        return (
          <li
            key={day.id}
            className="flex flex-col gap-3 px-3 py-2 md:flex-row md:items-start"
          >
            <label className="flex min-h-10 items-center gap-3 md:w-48 md:shrink-0">
              <Switch
                checked={on}
                disabled={full && !on}
                onCheckedChange={(checked) => toggle(day.id, checked)}
              />
              <span
                className={cn(
                  "text-sm",
                  full && !on && "text-muted-foreground",
                )}
              >
                {day.long}
              </span>
            </label>
            {on && (
              <div className="min-w-0 flex-1">
                {hint ? (
                  <Hint>{hint}</Hint>
                ) : starts.length === 0 ? (
                  <Hint>
                    Nenhum horário livre em todas as datas deste dia no período.
                  </Hint>
                ) : (
                  <AvailableTimes
                    id={`${id}-${day.id}`}
                    starts={starts}
                    value={value[day.id] ?? ""}
                    onChange={(time) => onChange({ ...value, [day.id]: time })}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex min-h-10 items-center rounded-control border border-dashed border-border px-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
