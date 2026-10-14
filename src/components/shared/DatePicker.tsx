"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  id: string;
  name: string;
  placeholder?: string;
  /** Datas depois deste limite ficam desabilitadas (ex.: nascimento → hoje). */
  maxDate?: Date;
};

// Data local como "aaaa-mm-dd", sem passar por UTC (que poderia mudar o dia).
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Campo de data com calendário. O valor vai no formulário como "aaaa-mm-dd"
// (campo oculto), o formato que a API espera.
export function DatePicker({
  id,
  name,
  placeholder = "dd/mm/aaaa",
  maxDate,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <input type="hidden" name={name} value={date ? toIsoDate(date) : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full justify-between bg-transparent px-2.5 font-normal"
          >
            <span className={date ? undefined : "text-muted-foreground"}>
              {date
                ? new Intl.DateTimeFormat("pt-BR").format(date)
                : placeholder}
            </span>
            <CalendarDays
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              setDate(selected);
              setOpen(false);
            }}
            locale={ptBR}
            // Mês e ano em listas: datas de nascimento ficam longe de hoje.
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={maxDate ?? new Date()}
            defaultMonth={date ?? maxDate}
            disabled={maxDate ? { after: maxDate } : undefined}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
