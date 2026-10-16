"use client";

import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { WeekDay } from "@/types/business-hour";
import { cn } from "cn";

/** Horário inicial de cada dia marcado ("" = ainda sem horário). */
export type DayTimes = Partial<Record<WeekDay, string>>;

type RecurrenceDaysFieldProps = {
  value: DayTimes;
  onChange: (value: DayTimes) => void;
  invalid?: boolean;
};

/** Dias da semana da recorrência: marca o dia e informa o horário inicial. */
export function RecurrenceDaysField({
  value,
  onChange,
  invalid,
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
            className="flex min-h-14 items-center justify-between gap-3 px-3 py-2"
          >
            <label className="flex items-center gap-3">
              <Switch
                checked={on}
                onCheckedChange={(checked) => toggle(day.id, checked)}
              />
              <span className="text-sm">{day.long}</span>
            </label>
            {on && (
              <Input
                type="time"
                aria-label={`Horário inicial de ${day.long}`}
                className="w-32"
                value={value[day.id] ?? ""}
                onChange={(event) =>
                  onChange({ ...value, [day.id]: event.target.value })
                }
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
