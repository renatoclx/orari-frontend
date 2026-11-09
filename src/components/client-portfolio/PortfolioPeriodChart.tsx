"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  PortfolioSeriesPoint,
  PortfolioSummary,
} from "@/types/client-portfolio";
import { formatPrice } from "@/utils/format";

// Cores pelos tokens (trocam sozinhas no tema escuro); validadas para
// daltonismo e contraste com o script da skill de gráficos.
const config = {
  received: { label: "Recebido", color: "var(--success)" },
  pending: { label: "Pendente", color: "var(--chart-neutral)" },
} satisfies ChartConfig;

// "05/11" a partir de "2026-11-05".
const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

// Eixo em reais sem centavos, curto ("R$ 1,2 mil").
const axisMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

type Row = {
  date: string;
  completed: number;
  received: number;
  pending: number;
};

function TooltipBody({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  unit: "day" | "week";
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="grid min-w-44 gap-1.5 rounded-overlay border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">
        {unit === "week"
          ? `Semana de ${shortDate(row.date)}`
          : shortDate(row.date)}
      </p>
      {(["received", "pending"] as const).map((key) => (
        <p key={key} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2.5 rounded-[2px]"
              style={{ background: `var(--color-${key})` }}
              aria-hidden="true"
            />
            {config[key].label}
          </span>
          <span className="font-medium tabular-nums">
            {formatPrice(row[key])}
          </span>
        </p>
      ))}
      <p className="flex justify-between gap-4 border-t border-border pt-1.5">
        <span className="text-muted-foreground">Atendimentos</span>
        <span className="font-medium tabular-nums">{row.completed}</span>
      </p>
    </div>
  );
}

/**
 * Faturamento do período (screens/carteira-clientes.md): recebido e pendente
 * empilhados por dia (ou semana, em período longo). A quantidade de
 * atendimentos fica na dica: outra escala no mesmo gráfico confundiria.
 */
export function PortfolioPeriodChart({
  series,
}: {
  series: PortfolioSummary["series"];
}) {
  const rows: Row[] = series.points.map((point: PortfolioSeriesPoint) => ({
    date: point.date,
    completed: point.completed,
    received: Number(point.received),
    pending: Number(point.pending),
  }));
  const empty = rows.every((row) => row.received + row.pending === 0);

  return (
    <section
      aria-labelledby="portfolio-period-title"
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4"
    >
      <div>
        <h2 id="portfolio-period-title" className="font-semibold">
          Faturamento no período
        </h2>
        <p className="text-sm text-muted-foreground">
          Atendimentos concluídos, por{" "}
          {series.unit === "week" ? "semana" : "dia"}. Toque ou passe o mouse
          nas barras para ver os valores.
        </p>
      </div>

      {empty ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum atendimento concluído com valor no período.
        </p>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-44 w-full sm:h-52"
          // Leitor de tela: o resumo e a lista trazem os mesmos números.
          aria-label="Gráfico de barras do faturamento no período"
          role="img"
        >
          <BarChart data={rows} margin={{ left: 4, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={shortDate}
            />
            <YAxis
              width={64}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => axisMoney.format(value)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<TooltipBody unit={series.unit} />}
            />
            {/* Pendente em cima: o arredondado fica só na ponta da pilha. */}
            <Bar
              dataKey="received"
              stackId="total"
              fill="var(--color-received)"
              stroke="var(--card)"
              strokeWidth={1}
              maxBarSize={32}
            />
            <Bar
              dataKey="pending"
              stackId="total"
              fill="var(--color-pending)"
              stroke="var(--card)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ChartContainer>
      )}
      {!empty && (
        // Legenda na ordem da leitura (recebido, depois pendente).
        <ul className="flex justify-center gap-4 text-xs text-muted-foreground">
          {(["received", "pending"] as const).map((key) => (
            <li key={key} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-[2px]"
                style={{ background: config[key].color }}
                aria-hidden="true"
              />
              {config[key].label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
