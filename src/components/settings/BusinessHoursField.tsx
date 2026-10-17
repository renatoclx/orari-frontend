"use client";

import { Plus, Trash2 } from "lucide-react";
import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import type { BusinessHourDraft } from "@/components/settings/business-hours-validation";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WeekDay } from "@/types/business-hour";
import { timeToMinutes } from "@/utils/time";

type BusinessHoursFieldProps = {
  drafts: BusinessHourDraft[];
  onChange: (drafts: BusinessHourDraft[]) => void;
  /** Erro de cada janela, pela chave. */
  errors: Record<string, string>;
  /** Gera a chave de uma janela nova (ainda sem id da API). */
  newKey: () => string;
};

/**
 * Horários de funcionamento: os sete dias, cada um com uma ou mais janelas de
 * atendimento (o almoço é o intervalo entre duas janelas). Dia sem janela é
 * fechado.
 */
export function BusinessHoursField({
  drafts,
  onChange,
  errors,
  newKey,
}: BusinessHoursFieldProps) {
  function update(key: string, field: "openAt" | "closeAt", value: string) {
    onChange(
      drafts.map((draft) =>
        draft.key === key ? { ...draft, [field]: value } : draft,
      ),
    );
  }

  // Nova janela: começa onde a última do dia termina (ou às 09:00).
  function add(weekDay: WeekDay) {
    const last = drafts
      .filter((draft) => draft.weekDay === weekDay)
      .sort((a, b) => timeToMinutes(a.closeAt) - timeToMinutes(b.closeAt))
      .at(-1);
    onChange([
      ...drafts,
      {
        key: newKey(),
        weekDay,
        openAt: last?.closeAt ?? "09:00",
        closeAt: last ? "" : "18:00",
      },
    ]);
  }

  return (
    <ul className="divide-y divide-border">
      {WEEK_DAYS.map((day) => {
        const windows = drafts
          .filter((draft) => draft.weekDay === day.id)
          .sort(
            (a, b) =>
              timeToMinutes(a.openAt || "00:00") -
              timeToMinutes(b.openAt || "00:00"),
          );
        return (
          <li
            key={day.id}
            className="flex flex-col gap-3 py-3 md:flex-row md:items-start"
          >
            <p className="flex min-h-10 items-center text-sm font-medium md:w-40 md:shrink-0">
              {day.long}
            </p>
            <div className="min-w-0 flex-1 space-y-2">
              {windows.length === 0 && (
                <p className="flex min-h-10 items-center text-sm text-muted-foreground">
                  Fechado
                </p>
              )}
              {windows.map((window) => (
                <div key={window.key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      step={900}
                      aria-label={`Abertura de ${day.long}`}
                      aria-invalid={Boolean(errors[window.key]) || undefined}
                      className="w-32"
                      value={window.openAt}
                      onChange={(event) =>
                        update(window.key, "openAt", event.target.value)
                      }
                    />
                    <span className="text-sm text-muted-foreground">às</span>
                    <Input
                      type="time"
                      step={900}
                      aria-label={`Fechamento de ${day.long}`}
                      aria-invalid={Boolean(errors[window.key]) || undefined}
                      className="w-32"
                      value={window.closeAt}
                      onChange={(event) =>
                        update(window.key, "closeAt", event.target.value)
                      }
                    />
                    <Hint label="Remover esta janela">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover a janela de ${day.long}`}
                        onClick={() =>
                          onChange(drafts.filter((d) => d.key !== window.key))
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </Hint>
                  </div>
                  {errors[window.key] && (
                    <p role="alert" className="text-sm text-destructive">
                      {errors[window.key]}
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
              Adicionar janela
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
