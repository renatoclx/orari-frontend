"use client";

import type { DayTimes } from "@/components/recurrences/RecurrenceDaysField";
import {
  sortClassDays,
  weekDayLong,
} from "@/components/class-groups/class-group-rules";
import { Switch } from "@/components/ui/switch";
import type { ClassGroupDay } from "@/types/class-group";
import { cn } from "cn";

type ClassDaysFieldProps = {
  /** Id da lista (foco em caso de erro); único na tela. */
  id: string;
  /** Horários da turma: os dias só saem daqui. */
  slots: ClassGroupDay[];
  /** Mesmo formato do campo de dias livres: um horário por dia da semana. */
  value: DayTimes;
  onChange: (value: DayTimes) => void;
  invalid?: boolean;
  /** Limite de dias (plano: os atendimentos por semana). */
  maxDays?: number;
};

/**
 * Dias da recorrência (ou do serviço do plano) numa turma fixa: escolhidos
 * entre os horários dela. Um horário por dia da semana; escolher outro horário
 * do mesmo dia troca o anterior. As vagas são conferidas pela API ao gravar.
 */
export function ClassDaysField({
  id,
  slots,
  value,
  onChange,
  invalid,
  maxDays,
}: ClassDaysFieldProps) {
  const full = maxDays !== undefined && Object.keys(value).length >= maxDays;

  return (
    <ul
      id={id}
      tabIndex={-1}
      className={cn(
        "divide-y divide-border rounded-control border border-border",
        invalid && "border-destructive",
      )}
    >
      {sortClassDays(slots).map((slot) => {
        const on = value[slot.weekDay] === slot.startTime;
        // No limite, só se troca o horário de um dia já escolhido.
        const disabled = full && !on && !(slot.weekDay in value);
        return (
          <li key={`${slot.weekDay}-${slot.startTime}`} className="px-3 py-2">
            <label className="flex min-h-10 items-center gap-3">
              <Switch
                checked={on}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  const next = { ...value };
                  if (checked) next[slot.weekDay] = slot.startTime;
                  else delete next[slot.weekDay];
                  onChange(next);
                }}
              />
              <span
                className={cn(
                  "text-sm tabular-nums",
                  disabled && "text-muted-foreground",
                )}
              >
                {weekDayLong(slot.weekDay)}, {slot.startTime}–{slot.endTime}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
