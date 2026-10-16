"use client";

import { useState } from "react";
import {
  PERIODS,
  periodOf,
  type Period,
} from "@/components/agenda/agenda-availability";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { minutesToTime, timeToMinutes } from "@/utils/time";

type AvailableTimesProps = {
  /** Id do campo de período (para o foco em caso de erro). */
  id: string;
  /** Horários de início possíveis, em minutos desde a meia-noite. */
  starts: number[];
  /** Horário escolhido ("HH:mm") ou vazio. */
  value: string;
  onChange: (time: string) => void;
  invalid?: boolean;
};

/**
 * Horários disponíveis: uma caixa de seleção do período (só os que têm horário)
 * e os horários do período escolhido como botões. O período evita uma lista
 * enorme dentro do dialog.
 */
export function AvailableTimes({
  id,
  starts,
  value,
  onChange,
  invalid,
}: AvailableTimesProps) {
  const [choice, setChoice] = useState<Period | null>(null);

  const groups = PERIODS.map((period) => ({
    ...period,
    times: starts.filter((start) => periodOf(start) === period.id),
  })).filter((group) => group.times.length > 0);

  // Período mostrado: o escolhido; senão o do horário marcado; senão o primeiro.
  const selectedPeriod = value ? periodOf(timeToMinutes(value)) : null;
  const active =
    groups.find((group) => group.id === choice) ??
    groups.find((group) => group.id === selectedPeriod) ??
    groups[0];

  if (!active) return null;

  return (
    <div className="space-y-3">
      <Select
        value={active.id}
        onValueChange={(next) => setChoice(next as Period)}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-label="Período"
          aria-invalid={invalid ? true : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.label} · {group.times.length}{" "}
              {group.times.length === 1 ? "horário" : "horários"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div
        role="group"
        aria-label={`Horários da ${active.label.toLowerCase()}`}
        className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto p-0.5"
      >
        {active.times.map((start) => {
          const time = minutesToTime(start);
          const selected = time === value;
          return (
            <Button
              key={start}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              className="tabular-nums"
              onClick={() => onChange(time)}
            >
              {time}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
