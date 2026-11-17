"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  monthLabel,
  monthLongLabel,
} from "@/components/platform-dashboard/platform-format";

type Point = { month: string; count: number };

function TooltipBody({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
  unit: [string, string];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="grid gap-1 rounded-overlay border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium first-letter:uppercase">
        {monthLongLabel(point.month)}
      </p>
      <p className="tabular-nums">
        <strong>{point.count}</strong> {point.count === 1 ? unit[0] : unit[1]}
      </p>
    </div>
  );
}

/**
 * Uma série por mês (12 meses), em colunas de uma cor só: novas empresas ou
 * agendamentos criados. O total do período fica no subtítulo; o mês, na dica.
 */
export function MonthlyBarsChart({
  id,
  title,
  description,
  points,
  color,
  unit,
}: {
  id: string;
  title: string;
  description: string;
  points: Point[];
  /** Token de gráfico (ex.: "var(--chart-info)"). */
  color: string;
  /** Singular e plural da unidade na dica. */
  unit: [string, string];
}) {
  const config = { count: { label: title, color } } satisfies ChartConfig;
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const current = points.at(-1)?.count ?? 0;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`${id}-title`} className="font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="text-right text-sm text-muted-foreground tabular-nums">
          <span className="block text-xl font-semibold text-foreground">
            {current}
          </span>
          neste mês · {total} em 12 meses
        </p>
      </div>
      {total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nada nos últimos 12 meses.
        </p>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-48 w-full"
          role="img"
          aria-label={`${title}: ${current} neste mês e ${total} nos últimos 12 meses`}
        >
          <BarChart data={points} margin={{ left: 4, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
              tickFormatter={monthLabel}
            />
            <YAxis
              width={32}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<TooltipBody unit={unit} />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      )}
    </section>
  );
}
