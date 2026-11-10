import type { AppointmentBreakdown } from "@/types/appointment-report";
import { formatPercent } from "@/utils/format";

type Row = AppointmentBreakdown & { minutes?: number };

// "12h30" a partir dos minutos somados.
const hoursLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, "0")}` : `${hours}h`;
};

/**
 * Agendamentos por profissional ou por serviço: tabela curta, sem paginação,
 * para comparar. A coluna de horas aparece só quando há `minutes` (serviços).
 */
export function AppointmentBreakdownTable({
  title,
  nameHeader,
  rows,
}: {
  title: string;
  nameHeader: string;
  rows: Row[];
}) {
  const withHours = rows.some((row) => row.minutes !== undefined);
  const noShowRate = (row: Row) =>
    row.completed + row.noShow > 0
      ? formatPercent(row.noShow / (row.completed + row.noShow))
      : "--";

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4 print:break-inside-avoid">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhum agendamento no período.
        </p>
      ) : (
        // Rola de lado no celular: com foco, dá para rolar pelo teclado.
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label={title}
        >
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-border text-left whitespace-nowrap text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">
                  {nameHeader}
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Agendamentos
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Concluídos
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Faltas
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Taxa de falta
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Cancelados
                </th>
                {withHours && (
                  <th scope="col" className="py-2 pl-2 text-right font-medium">
                    Horas
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className="py-2 pr-3 text-left font-medium">
                    {row.name}
                  </th>
                  <td className="px-2 py-2 text-right">{row.total}</td>
                  <td className="px-2 py-2 text-right">{row.completed}</td>
                  <td className="px-2 py-2 text-right">{row.noShow}</td>
                  <td className="px-2 py-2 text-right">{noShowRate(row)}</td>
                  <td className="px-2 py-2 text-right">{row.cancelled}</td>
                  {withHours && (
                    <td className="py-2 pl-2 text-right">
                      {hoursLabel(row.minutes ?? 0)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
