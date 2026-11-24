import { STATUS_SERIES } from "@/components/platform-dashboard/platform-format";
import type { PlatformDashboard } from "@/types/platform-dashboard";

/**
 * Situação das empresas: uma barra empilhada (cada empresa conta uma vez) e a
 * legenda com o nome e o número de cada situação, para a cor nunca falar
 * sozinha.
 */
export function StatusBreakdown({ data }: { data: PlatformDashboard }) {
  const total = data.byStatus.reduce((sum, item) => sum + item.companies, 0);
  const present = data.byStatus.filter((item) => item.companies > 0);

  return (
    <section
      aria-labelledby="status-title"
      className="flex min-w-0 flex-col gap-4 rounded-card border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="status-title" className="font-semibold">
            Situação das empresas
          </h2>
          <p className="text-sm text-muted-foreground">
            Em que pé está cada empresa.
          </p>
        </div>
        <p className="text-right text-sm text-muted-foreground tabular-nums">
          <span className="block text-xl font-semibold text-foreground">
            {total}
          </span>
          empresas
        </p>
      </div>

      {total > 0 && (
        // Espaço de 2 px entre as faixas (a cor do cartão aparece entre elas).
        <div
          className="flex h-4 gap-0.5 overflow-hidden rounded-full"
          aria-hidden="true"
        >
          {present.map((item) => (
            <div
              key={item.status}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                flexGrow: item.companies,
                background: STATUS_SERIES[item.status].color,
              }}
            />
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {data.byStatus.map((item) => (
          <li key={item.status} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ background: STATUS_SERIES[item.status].color }}
              aria-hidden="true"
            />
            <span className="truncate text-muted-foreground">
              {STATUS_SERIES[item.status].label}
            </span>
            <strong className="ml-auto tabular-nums">{item.companies}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
