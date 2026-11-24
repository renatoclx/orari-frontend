"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  AppointmentReport,
  AppointmentReportPoint,
} from "@/types/appointment-report";

// Tokens de gráfico validados (globals.css). A pilha soma o total (sem os
// cancelados, que ficam na dica); o índigo separa o verde do vermelho.
const config = {
  completed: { label: "Concluídos", color: "var(--chart-positive)" },
  open: { label: "A acontecer", color: "var(--chart-info)" },
  noShow: { label: "Faltas", color: "var(--chart-negative)" },
} satisfies ChartConfig;
const KEYS = ["completed", "open", "noShow"] as const;

// "05/11" a partir de "2026-11-05".
const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

function TooltipBody({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: AppointmentReportPoint }[];
  unit: "day" | "week";
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="grid min-w-40 gap-1.5 rounded-overlay border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">
        {unit === "week"
          ? `Semana de ${shortDate(row.date)}`
          : shortDate(row.date)}
      </p>
      {KEYS.map((key) => (
        <p key={key} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2.5 rounded-[2px]"
              style={{ background: `var(--color-${key})` }}
              aria-hidden="true"
            />
            {config[key].label}
          </span>
          <span className="font-medium tabular-nums">{row[key]}</span>
        </p>
      ))}
      <p className="flex justify-between gap-4 border-t border-border pt-1.5">
        <span className="text-muted-foreground">Cancelados</span>
        <span className="font-medium tabular-nums">{row.cancelled}</span>
      </p>
    </div>
  );
}

/**
 * Agendamentos por dia (ou semana, em período longo): concluídos, a acontecer
 * e faltas empilhados; os cancelados aparecem na dica.
 */
export function AppointmentPeriodChart({
  series,
  print = false,
}: {
  series: AppointmentReport["series"];
  /** Versão de impressão: sem animação (a folha sai com as barras inteiras). */
  print?: boolean;
}) {
  const empty = series.points.every(
    (point) => point.completed + point.open + point.noShow === 0,
  );

  return (
    <section
      aria-labelledby="appointment-period-title"
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4 print:break-inside-avoid"
    >
      <div>
        <h2 id="appointment-period-title" className="font-semibold">
          Agendamentos no período
        </h2>
        <p className="text-sm text-muted-foreground">
          Por {series.unit === "week" ? "semana" : "dia"}, sem os cancelados.
          <span className="print:hidden">
            {" "}
            Toque ou passe o mouse nas barras para ver os números.
          </span>
        </p>
      </div>

      {empty ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum agendamento no período.
        </p>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-44 w-full sm:h-52"
          // Leitor de tela: os cartões e as tabelas trazem os mesmos números.
          aria-label="Gráfico de barras dos agendamentos no período"
          role="img"
        >
          <BarChart data={series.points} margin={{ left: 4, right: 4, top: 4 }}>
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
              width={32}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<TooltipBody unit={series.unit} />}
            />
            {KEYS.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="total"
                fill={`var(--color-${key})`}
                stroke="var(--card)"
                strokeWidth={1}
                maxBarSize={32}
                isAnimationActive={!print}
                // O arredondado fica só na ponta da pilha.
                radius={index === KEYS.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ChartContainer>
      )}
      {!empty && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {KEYS.map((key) => (
            <li
              key={key}
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
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
