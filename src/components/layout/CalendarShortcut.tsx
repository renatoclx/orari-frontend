"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isDateString } from "@/utils/time";

type CalendarShortcutProps = {
  /** "bar": colado à barra lateral; "header": abaixo do botão, no celular. */
  placement: "bar" | "header";
};

// "aaaa-mm-dd" → Date no início desse dia, no relógio do navegador (é o que o
// calendário compara).
function parseDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Date escolhido no calendário → "aaaa-mm-dd" (os campos locais, sem fuso).
function formatDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Atalho do calendário, usado pela barra lateral (computador) e pelo header
// (celular). Escolher um dia leva à agenda daquele dia.
export function CalendarShortcut({ placement }: CalendarShortcutProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const inBar = placement === "bar";

  // Dia exibido na agenda (?date=); sem ele, hoje.
  const param = useSearchParams().get("date");
  const selected = param && isDateString(param) ? parseDay(param) : new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Abrir calendário"
        title="Calendário"
        className="rounded-control p-2 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <CalendarDays className="size-5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        side={inBar ? "left" : "bottom"}
        align={inBar ? "center" : "end"}
        sideOffset={inBar ? 0 : 8}
        className={
          inBar
            ? "w-auto rounded-l-overlay rounded-r-none border-r-0 p-2"
            : "w-auto rounded-overlay p-2"
        }
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          locale={ptBR}
          onSelect={(day) => {
            // Clicar no dia já selecionado limpa a seleção: nada a fazer.
            if (!day) return;
            setOpen(false);
            router.push(`/?date=${formatDay(day)}`);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
