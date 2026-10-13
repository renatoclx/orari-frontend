import { ChevronLeft, ChevronRight } from "lucide-react";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

type MiniCalendarProps = {
  year: number;
  /** 0 = janeiro */
  month: number;
  selectedDay: number;
};

export function MiniCalendar({ year, month, selectedDay }: MiniCalendarProps) {
  const firstWeekDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const monthText = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
  const monthLabel = monthText.charAt(0).toUpperCase() + monthText.slice(1);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{monthLabel}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Mês anterior"
            className="rounded-control p-1 text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Próximo mês"
            className="rounded-control p-1 text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {weekDays.map((day, index) => (
          <span key={index} className="py-1 text-muted" aria-hidden="true">
            {day}
          </span>
        ))}
        {cells.map((day, index) =>
          day === null ? (
            <span key={`empty-${index}`} />
          ) : (
            <button
              key={day}
              type="button"
              aria-current={day === selectedDay ? "date" : undefined}
              className={`mx-auto flex size-8 items-center justify-center rounded-full tabular-nums focus-visible:outline-2 focus-visible:outline-brand ${
                day === selectedDay
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "hover:bg-background"
              }`}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </section>
  );
}
