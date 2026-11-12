"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

/**
 * Escolhe qualquer dia da agenda. O campo de data do próprio aparelho é o
 * melhor seletor no celular, e a lista do dia é refeita no servidor pela URL.
 */
export function AgendaDatePicker({ day }: { day: string }) {
  const router = useRouter();
  return (
    <label className="relative flex size-10 shrink-0 items-center justify-center rounded-control border border-border bg-card text-muted-foreground hover:text-foreground">
      <CalendarDays className="size-5" aria-hidden="true" />
      <span className="sr-only">Escolher o dia</span>
      <input
        type="date"
        value={day}
        onChange={(event) => {
          // O campo pode ficar vazio ao limpar: sem data, nada a fazer.
          if (event.target.value) {
            router.push(`/app/agenda?dia=${event.target.value}`);
          }
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
