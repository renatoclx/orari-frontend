"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  endTimeOf,
  type ClassSlotDraft,
} from "@/components/class-groups/class-group-rules";
import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WeekDay } from "@/types/business-hour";
import { timeToMinutes } from "@/utils/time";

type ClassGroupDaysFieldProps = {
  /** Id da lista (foco em caso de erro). */
  id: string;
  slots: ClassSlotDraft[];
  onChange: (slots: ClassSlotDraft[]) => void;
  /** Erro de cada horário, pela chave. */
  errors: Record<string, string>;
  /** Duração do serviço em minutos (0 = serviço não escolhido: sem o fim). */
  duration: number;
  /** Gera a chave de um horário novo. */
  newKey: () => string;
};

/**
 * Dias e horários da turma, no mesmo desenho do funcionamento (Configurações):
 * os sete dias, cada um com zero ou mais horários de início. O fim é calculado
 * pela duração do serviço; dia sem horário não tem turma.
 */
export function ClassGroupDaysField({
  id,
  slots,
  onChange,
  errors,
  duration,
  newKey,
}: ClassGroupDaysFieldProps) {
  // Novo horário: começa quando o último do dia termina (ou às 08:00).
  function add(weekDay: WeekDay) {
    const last = slots
      .filter((slot) => slot.weekDay === weekDay && slot.startTime)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
      .at(-1);
    const next =
      last && duration > 0 ? endTimeOf(last.startTime, duration) : "08:00";
    onChange([
      ...slots,
      { key: newKey(), weekDay, startTime: next === "24:00" ? "" : next },
    ]);
  }

  return (
    <ul id={id} tabIndex={-1} className="divide-y divide-border outline-none">
      {WEEK_DAYS.map((day) => {
        const daySlots = slots.filter((slot) => slot.weekDay === day.id);
        return (
          <li
            key={day.id}
            className="flex flex-col gap-3 py-3 md:flex-row md:items-start"
          >
            <p className="flex min-h-10 items-center text-sm font-medium md:w-40 md:shrink-0">
              {day.long}
            </p>
            <div className="min-w-0 flex-1 space-y-2">
              {daySlots.length === 0 && (
                <p className="flex min-h-10 items-center text-sm text-muted-foreground">
                  Sem turma
                </p>
              )}
              {daySlots.map((slot) => (
                <div key={slot.key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      step={900}
                      aria-label={`Início em ${day.long}`}
                      aria-invalid={Boolean(errors[slot.key]) || undefined}
                      className="w-32"
                      value={slot.startTime}
                      onChange={(event) =>
                        onChange(
                          slots.map((item) =>
                            item.key === slot.key
                              ? { ...item, startTime: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    {duration > 0 && slot.startTime && (
                      <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                        até {endTimeOf(slot.startTime, duration)}
                      </span>
                    )}
                    <Hint label="Remover este horário">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover o horário de ${day.long}`}
                        onClick={() =>
                          onChange(slots.filter((s) => s.key !== slot.key))
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </Hint>
                  </div>
                  {errors[slot.key] && (
                    <p role="alert" className="text-sm text-destructive">
                      {errors[slot.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="md:shrink-0"
              onClick={() => add(day.id)}
            >
              <Plus aria-hidden="true" />
              Adicionar horário
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
