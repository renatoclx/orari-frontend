"use client";

import { CalendarDays } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type CalendarShortcutProps = {
  /** "bar": colado à barra lateral; "header": abaixo do botão, no celular. */
  placement: "bar" | "header";
};

// Atalho do calendário, usado pela barra lateral (computador) e pelo header
// (celular).
export function CalendarShortcut({ placement }: CalendarShortcutProps) {
  // Provisório: o calendário mostra o dia de hoje até a agenda ter estado real.
  const today = new Date();
  const inBar = placement === "bar";

  return (
    <Popover>
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
          selected={today}
          defaultMonth={today}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
