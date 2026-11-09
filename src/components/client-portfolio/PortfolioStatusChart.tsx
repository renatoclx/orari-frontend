import Link from "next/link";
import {
  PORTFOLIO_PATH,
  portfolioQuery,
  type PortfolioFiltersState,
} from "@/components/client-portfolio/portfolio-filters";
import { Hint } from "@/components/shared/Hint";
import type { PortfolioSummary } from "@/types/client-portfolio";
import { cn } from "cn";

type PortfolioStatusChartProps = {
  summary: PortfolioSummary;
  filters: PortfolioFiltersState;
  month: { from: string; to: string };
};

/**
 * Situação dos clientes da carteira numa barra segmentada (um todo em três
 * partes; a rosca fica de fora pela regra dos gráficos). Verde e vermelho se
 * confundem para parte dos daltônicos: cada parte tem nome e número na
 * legenda, e um espaço separa os blocos. A legenda filtra a lista.
 */
export function PortfolioStatusChart({
  summary,
  filters,
  month,
}: PortfolioStatusChartProps) {
  const active = summary.clients - summary.newClients - summary.lapsedClients;
  const parts = [
    {
      key: "novos",
      label: "Novos",
      count: summary.newClients,
      className: "bg-chart-neutral",
    },
    {
      key: "ativos",
      label: "Ativos",
      count: active,
      className: "bg-success",
    },
    {
      key: "sem-retorno",
      label: "Sem retorno",
      count: summary.lapsedClients,
      className: "bg-destructive",
    },
  ];
  const percent = (count: number) =>
    summary.clients > 0 ? Math.round((count / summary.clients) * 100) : 0;

  return (
    <section
      aria-labelledby="portfolio-status-title"
      className="flex flex-col gap-4 rounded-card border border-border bg-card p-4"
    >
      <div>
        <h2 id="portfolio-status-title" className="font-semibold">
          Situação dos clientes
        </h2>
        <p className="text-sm text-muted-foreground">
          Novos no período; ativos e sem retorno, hoje.
        </p>
      </div>

      {summary.clients === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum cliente na carteira ainda.
        </p>
      ) : (
        <>
          {/* Só o desenho: os números estão na legenda logo abaixo. */}
          <div className="flex h-10 gap-0.5" aria-hidden="true">
            {parts
              .filter((part) => part.count > 0)
              .map((part) => (
                <Hint
                  key={part.key}
                  label={`${part.label}: ${part.count} (${percent(part.count)}%)`}
                >
                  <span
                    className={cn(
                      "h-full first:rounded-l-control last:rounded-r-control",
                      part.className,
                    )}
                    style={{ flexGrow: part.count, flexBasis: 0 }}
                  />
                </Hint>
              ))}
          </div>

          <ul className="flex flex-wrap gap-2 text-sm">
            {parts.map((part) => {
              const current = filters.status === part.key;
              // Clicar na situação filtra a lista; no filtro ativo, desfaz.
              const query = portfolioQuery(filters, month, {
                status: current ? "todas" : part.key,
                search: "",
              });
              return (
                <li key={part.key}>
                  <Link
                    href={`${PORTFOLIO_PATH}?${query}`}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "block rounded-control px-2 py-1.5 whitespace-nowrap transition-colors hover:bg-muted",
                      current && "bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className={cn("size-2.5 rounded-full", part.className)}
                        aria-hidden="true"
                      />
                      {part.label}
                    </span>
                    <span className="block font-semibold tabular-nums">
                      {part.count}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({percent(part.count)}%)
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
