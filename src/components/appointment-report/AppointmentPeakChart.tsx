import { WEEK_DAYS } from "@/components/appointment-report/appointment-report-filters";
import type { AppointmentReport } from "@/types/appointment-report";
import { cn } from "cn";

/**
 * Horários de pico (screens/relatorio-agendamentos.md): uma tabela de dias da
 * semana × hora de início, com a quantidade escrita em cada célula e a cor
 * mais forte onde há mais agendamentos (um tom só, o índigo dos gráficos).
 * Tabela de verdade: o leitor de tela anuncia o dia e a hora de cada número.
 */
export function AppointmentPeakChart({
  peak,
}: {
  peak: AppointmentReport["peak"];
}) {
  const max = Math.max(0, ...peak.map((cell) => cell.count));
  const hours =
    peak.length > 0
      ? Array.from(
          {
            length:
              Math.max(...peak.map((cell) => cell.hour)) -
              Math.min(...peak.map((cell) => cell.hour)) +
              1,
          },
          (_, index) => Math.min(...peak.map((cell) => cell.hour)) + index,
        )
      : [];
  const countAt = (weekDay: number, hour: number) =>
    peak.find((cell) => cell.weekDay === weekDay && cell.hour === hour)
      ?.count ?? 0;
  // De 15% a 60% do índigo: a célula com 1 agendamento ainda aparece, e o
  // número (na cor do texto) mantém o contraste nos dois temas.
  const strength = (count: number) => Math.round(15 + (45 * count) / max);

  return (
    <section
      aria-labelledby="appointment-peak-title"
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4 print:break-inside-avoid"
    >
      <div>
        <h2 id="appointment-peak-title" className="font-semibold">
          Horários de pico
        </h2>
        <p className="text-sm text-muted-foreground">
          Agendamentos por dia da semana e hora de início, sem os cancelados.
        </p>
      </div>

      {max === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum agendamento no período.
        </p>
      ) : (
        // Rola de lado no celular: com foco, dá para rolar pelo teclado.
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Tabela dos horários de pico"
        >
          <table className="w-full border-separate border-spacing-0.5 text-xs tabular-nums">
            <thead>
              <tr>
                <th scope="col" className="sr-only">
                  Dia
                </th>
                {hours.map((hour) => (
                  <th
                    key={hour}
                    scope="col"
                    className="min-w-7 pb-1 font-normal text-muted-foreground"
                  >
                    {hour}h
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEK_DAYS.map((day) => (
                <tr key={day.weekDay}>
                  <th
                    scope="row"
                    className="pr-2 text-left font-normal text-muted-foreground"
                  >
                    <span aria-hidden="true">{day.short}</span>
                    <span className="sr-only">{day.long}</span>
                  </th>
                  {hours.map((hour) => {
                    const count = countAt(day.weekDay, hour);
                    const value = count > 0 ? strength(count) : 0;
                    return (
                      <td
                        key={hour}
                        className={cn(
                          "h-7 rounded-[4px] text-center font-medium text-foreground",
                          count === 0 && "bg-muted/60",
                        )}
                        style={
                          count > 0
                            ? {
                                background: `color-mix(in oklab, var(--chart-info) ${value}%, var(--card))`,
                              }
                            : undefined
                        }
                      >
                        {count > 0 ? count : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
