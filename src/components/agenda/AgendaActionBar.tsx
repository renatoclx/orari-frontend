import { CalendarDays } from "lucide-react";
import { MiniCalendar } from "@/components/agenda/MiniCalendar";

const CALENDAR_ID = "agenda-calendar";

// A Popover API do navegador cuida de abrir, fechar ao clicar fora e fechar
// com Esc — sem JavaScript nosso e sem precisar de Client Component.
export function AgendaActionBar() {
  return (
    <div className="fixed top-1/2 right-0 z-30 -translate-y-1/2">
      <div className="flex w-12 flex-col items-center gap-1 rounded-l-overlay border border-r-0 border-border bg-surface py-1.5 shadow-lg">
        <button
          type="button"
          popoverTarget={CALENDAR_ID}
          aria-label="Abrir calendário"
          title="Calendário"
          className="rounded-control p-2 text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
        >
          <CalendarDays className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div
        id={CALENDAR_ID}
        popover="auto"
        className="inset-auto top-1/2 right-12 m-0 w-72 -translate-y-1/2 rounded-l-overlay border border-r-0 border-border bg-surface p-0 text-foreground shadow-lg"
      >
        <MiniCalendar year={2026} month={9} selectedDay={12} />
      </div>
    </div>
  );
}
