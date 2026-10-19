"use client";

import { shortDayLabel } from "@/components/recurrences/recurrence-schedule";
import {
  RecurrenceDaysField,
  type DayTimes,
} from "@/components/recurrences/RecurrenceDaysField";
import { FormField } from "@/components/shared/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeRange } from "@/types/agenda";
import type { WeekDay } from "@/types/business-hour";
import { formatDuration } from "@/utils/format";
import { cn } from "cn";

/** Agenda de um serviço como o formulário a edita. */
export type ScheduleDraft = { professionalId: string; dayTimes: DayTimes };

type ScheduleBlockProps = {
  service: {
    id: string;
    name: string;
    duration: number;
    sessionsPerWeek: number;
  };
  professionals: { id: string; name: string }[];
  value: ScheduleDraft;
  onChange: (value: ScheduleDraft) => void;
  /** Dados do período (sem eles, os horários pedem que sejam escolhidos). */
  clientId: string;
  startDate: string;
  endDate: string;
  /** Sessões dos outros serviços desta contratação, por dia da semana. */
  extraBusy: Partial<Record<WeekDay, TimeRange[]>>;
  /** Quantas sessões este serviço terá no período (0 = ainda sem agenda). */
  sessions: number;
  /** Data da primeira sessão ("aaaa-mm-dd"), quando há agenda. */
  firstSession?: string;
  error?: { professional?: string; days?: string };
};

/**
 * Agenda de um serviço do plano: profissional e exatamente a quantidade de dias
 * da semana que o plano prevê, com os horários livres no período inteiro.
 */
export function ScheduleBlock({
  service,
  professionals,
  value,
  onChange,
  clientId,
  startDate,
  endDate,
  extraBusy,
  sessions,
  firstSession,
  error = {},
}: ScheduleBlockProps) {
  const marked = Object.keys(value.dayTimes).length;
  const needed = service.sessionsPerWeek;
  const ids = {
    professional: `schedule-${service.id}-professional`,
    days: `schedule-${service.id}-days`,
  };

  return (
    <div className="space-y-4 rounded-control border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">
          {service.name}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {formatDuration(service.duration)} por atendimento
          </span>
        </h3>
        <p
          className={cn(
            "text-sm tabular-nums",
            marked === needed ? "text-success" : "text-muted-foreground",
          )}
        >
          {marked} de {needed} {needed === 1 ? "dia" : "dias"} por semana
          {sessions > 0 &&
            ` · ${sessions} ${sessions === 1 ? "sessão" : "sessões"} no período`}
          {firstSession && ` · primeira em ${shortDayLabel(firstSession)}`}
        </p>
      </div>

      <div className="max-w-sm">
        <FormField
          id={ids.professional}
          label="Profissional"
          required
          error={error.professional}
        >
          <Select
            value={value.professionalId || undefined}
            onValueChange={(professionalId) =>
              // Outro profissional, outros horários livres: os dias continuam.
              onChange({
                professionalId,
                dayTimes: Object.fromEntries(
                  Object.keys(value.dayTimes).map((day) => [day, ""]),
                ),
              })
            }
          >
            <SelectTrigger id={ids.professional} className="w-full">
              <SelectValue placeholder="Selecione o profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id={ids.days}
        label={`Dias da semana (escolha ${needed})`}
        required
        error={error.days}
      >
        <RecurrenceDaysField
          id={ids.days}
          value={value.dayTimes}
          onChange={(dayTimes) => onChange({ ...value, dayTimes })}
          invalid={Boolean(error.days)}
          clientId={clientId}
          professionalId={value.professionalId}
          duration={service.duration}
          startDate={startDate}
          endDate={endDate}
          extraBusy={extraBusy}
          maxDays={needed}
        />
      </FormField>
    </div>
  );
}
