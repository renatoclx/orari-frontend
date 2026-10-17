"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { saveBusinessHoursAction } from "@/app/(admin)/company-actions";
import { WEEK_DAYS } from "@/components/recurrences/recurrence-schedule";
import {
  validateBusinessHours,
  type BusinessHourDraft,
} from "@/components/settings/business-hours-validation";
import { FormFooter } from "@/components/shared/FormFooter";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusinessHour, WeekDay } from "@/types/business-hour";
import { timeToMinutes } from "@/utils/time";

type BusinessHoursFormProps = {
  hours: BusinessHour[];
  /** Conteúdo antes dos horários (dados da empresa), dentro do mesmo card. */
  children?: React.ReactNode;
};

const toDrafts = (hours: BusinessHour[]): BusinessHourDraft[] =>
  hours.map((hour) => ({ key: hour.id, ...hour }));

// Para comparar com o que veio da API (ordem das janelas não importa).
const snapshot = (drafts: BusinessHourDraft[]) =>
  JSON.stringify(
    drafts
      .map(({ id, weekDay, openAt, closeAt }) => [id, weekDay, openAt, closeAt])
      .sort(),
  );

/**
 * Horários de funcionamento: os sete dias, cada um com uma ou mais janelas de
 * atendimento (o almoço é o intervalo entre duas janelas). Dia sem janela é
 * fechado. Tudo é gravado junto, em "Salvar horários".
 */
export function BusinessHoursForm({ hours, children }: BusinessHoursFormProps) {
  const [drafts, setDrafts] = useState(() => toDrafts(hours));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  // Chave das janelas novas (ainda sem id da API).
  const [nextKey, setNextKey] = useState(1);

  const changed = snapshot(drafts) !== snapshot(toDrafts(hours));

  function update(key: string, field: "openAt" | "closeAt", value: string) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, [field]: value } : draft,
      ),
    );
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  // Nova janela: começa onde a última do dia termina (ou às 09:00).
  function add(weekDay: WeekDay) {
    const last = drafts
      .filter((draft) => draft.weekDay === weekDay)
      .sort((a, b) => timeToMinutes(a.closeAt) - timeToMinutes(b.closeAt))
      .at(-1);
    setDrafts((current) => [
      ...current,
      {
        key: `new-${nextKey}`,
        weekDay,
        openAt: last?.closeAt ?? "09:00",
        closeAt: last ? "" : "18:00",
      },
    ]);
    setNextKey((key) => key + 1);
  }

  function remove(key: string) {
    setDrafts((current) => current.filter((draft) => draft.key !== key));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateBusinessHours(drafts);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Corrija os horários destacados.");
      return;
    }

    startTransition(async () => {
      const result = await saveBusinessHoursAction(drafts);
      if (result.ok) {
        toast.success("Horários de funcionamento salvos.");
      } else {
        toast.error("Não foi possível salvar os horários.", {
          description: result.message,
        });
      }
    });
  }

  return (
    // O formulário é o card da página: o conteúdo rola e o rodapé fica fixo.
    <form
      noValidate
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        {children}
        <section className="p-4 md:p-6">
          <h2 className="font-semibold">Horários de funcionamento</h2>
          <p className="text-sm text-muted-foreground">
            Janelas de atendimento de cada dia. Para um intervalo (almoço),
            cadastre duas janelas. Dia sem janela fica fechado (só encaixe).
          </p>
          <ul className="mt-2 divide-y divide-border">
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
                            aria-invalid={
                              Boolean(errors[window.key]) || undefined
                            }
                            className="w-32"
                            value={window.openAt}
                            onChange={(event) =>
                              update(window.key, "openAt", event.target.value)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            às
                          </span>
                          <Input
                            type="time"
                            step={900}
                            aria-label={`Fechamento de ${day.long}`}
                            aria-invalid={
                              Boolean(errors[window.key]) || undefined
                            }
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
                              onClick={() => remove(window.key)}
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
        </section>
      </div>

      <FormFooter note="Agendamentos já marcados não mudam com os novos horários.">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !changed}
          onClick={() => {
            setDrafts(toDrafts(hours));
            setErrors({});
          }}
        >
          <X aria-hidden="true" />
          Descartar alterações
        </Button>
        <Button type="submit" disabled={pending || !changed}>
          <Save aria-hidden="true" />
          {pending ? "Salvando…" : "Salvar horários"}
        </Button>
      </FormFooter>
    </form>
  );
}
