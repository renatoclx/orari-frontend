"use client";

import { useEffect, useRef } from "react";
import { dayChip, longDate } from "@/components/client-app/client-app";

type DayStripProps = {
  /** Dias da faixa, em ordem ("AAAA-MM-DD"). */
  days: string[];
  /** O dia escolhido (fica preenchido). */
  selected: string;
  /** Hoje: o botão dele diz "hoje" no lugar do dia da semana. */
  today?: string;
  onSelect: (day: string) => void;
};

/**
 * Faixa de dias que rola de lado, como no AppBarber: usada no Agendar do
 * cliente e na Agenda do profissional, para as duas terem o mesmo jeito.
 * O dia escolhido é rolado até o meio da faixa ao abrir e ao trocar.
 */
export function DayStrip({ days, selected, today, onSelect }: DayStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  // Só o começo da faixa: a lista pode ser recriada a cada render da tela, e
  // rolar de novo a cada toque em outro lugar seria incômodo.
  const firstDay = days[0];

  useEffect(() => {
    const strip = stripRef.current;
    const chosen = strip?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (!strip || !chosen) return;
    // Rola só a faixa (o scrollIntoView rolaria a página junto).
    strip.scrollTo({
      left: chosen.offsetLeft - (strip.clientWidth - chosen.clientWidth) / 2,
    });
  }, [selected, firstDay]);

  return (
    <div
      ref={stripRef}
      className="relative -mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
    >
      {days.map((day) => {
        const chip = dayChip(day);
        const isSelected = day === selected;
        return (
          <button
            key={day}
            type="button"
            aria-pressed={isSelected}
            aria-label={
              day === today ? `Hoje, ${longDate(day)}` : longDate(day)
            }
            onClick={() => onSelect(day)}
            className={`flex w-14 shrink-0 flex-col items-center rounded-control border py-2 text-center transition-colors ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary"
            }`}
          >
            <span className="text-xs">
              {day === today ? "hoje" : chip.weekday}
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {chip.day}
            </span>
            <span className="text-xs">{chip.month}</span>
          </button>
        );
      })}
    </div>
  );
}
