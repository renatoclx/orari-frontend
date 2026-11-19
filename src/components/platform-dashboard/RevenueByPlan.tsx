import {
  cycleLabel,
  planLabel,
} from "@/components/subscriptions/subscription-catalog";
import type { PlatformDashboard } from "@/types/platform-dashboard";
import { formatPercent, formatPrice } from "@/utils/format";

// Planos sem ordem de grandeza: as cores categóricas na ordem fixa (globals.css).
const PLAN_COLORS = [
  "var(--chart-cat-1)",
  "var(--chart-cat-2)",
  "var(--chart-cat-3)",
];

/**
 * De onde vem o MRR: uma barra por plano (a maior ocupa a largura toda), com
 * o valor e a participação escritos ao lado; os ciclos das pagantes embaixo.
 */
export function RevenueByPlan({ data }: { data: PlatformDashboard }) {
  const total = data.byPlan.reduce((sum, item) => sum + item.mrr, 0);
  const largest = Math.max(...data.byPlan.map((item) => item.mrr), 0);

  return (
    <section
      aria-labelledby="revenue-plan-title"
      className="flex min-w-0 flex-col gap-4 rounded-card border border-border bg-card p-4"
    >
      <div>
        <h2 id="revenue-plan-title" className="font-semibold">
          Quanto entra por plano
        </h2>
        <p className="text-sm text-muted-foreground">
          Valor por mês de cada plano, já com os descontos.
        </p>
      </div>

      <ul className="space-y-3">
        {data.byPlan.map((item, index) => (
          <li key={item.plan} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="size-2.5 rounded-[2px]"
                  style={{ background: PLAN_COLORS[index] }}
                  aria-hidden="true"
                />
                {planLabel(item.plan)}
                <span className="font-normal text-muted-foreground">
                  {item.companies === 1
                    ? "1 empresa"
                    : `${item.companies} empresas`}
                </span>
              </span>
              <span className="tabular-nums">
                <strong>{formatPrice(item.mrr)}</strong>
                <span className="ml-1.5 text-muted-foreground">
                  {total > 0 ? formatPercent(item.mrr / total) : "--"}
                </span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-full rounded-full"
                style={{
                  width: largest > 0 ? `${(item.mrr / largest) * 100}%` : 0,
                  background: PLAN_COLORS[index],
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">Como pagam:</span>
        {data.byCycle.map((item) => (
          <span
            key={item.cycle}
            className="rounded-full bg-muted px-2.5 py-0.5 tabular-nums"
          >
            {cycleLabel(item.cycle)} <strong>{item.companies}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
