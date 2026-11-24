"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type { FinancialReport } from "@/types/financial-report";
import { formatPrice } from "@/utils/format";

// Tokens de gráfico validados (globals.css): o mesmo par índigo/verde do
// relatório de agendamentos, que já passou na checagem de daltonismo. Produtos
// usa o laranja da paleta categórica.
const config = {
  appointments: { label: "Atendimentos", color: "var(--chart-info)" },
  packages: { label: "Pacotes", color: "var(--chart-positive)" },
  products: { label: "Produtos", color: "var(--chart-cat-2)" },
} satisfies ChartConfig;
type Key = keyof typeof config;
// Com Produtos, o índigo fica no meio da pilha: no escuro, verde e laranja
// lado a lado se confundem para quem tem deuteranopia (ΔE 4,5).
const BASE_KEYS: Key[] = ["appointments", "packages"];
const WITH_PRODUCTS: Key[] = ["packages", "appointments", "products"];

// O Recharts precisa de números; a API manda texto com duas casas.
type Row = {
  date: string;
  appointments: number;
  packages: number;
  products: number;
};
const rowTotal = (row: Row) => row.appointments + row.packages + row.products;

// "05/11" a partir de "2026-11-05".
const shortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

// Eixo em reais sem centavos, curto ("R$ 1,2 mil").
const axisMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

function TooltipBody({
  active,
  payload,
  unit,
  keys,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  unit: "day" | "week";
  keys: Key[];
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
      {keys.map((key) => (
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
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium tabular-nums">
          {formatPrice(rowTotal(row))}
        </span>
      </p>
    </div>
  );
}

/**
 * Recebido por dia (ou semana, em período longo), com atendimentos, pacotes e
 * (quando a empresa vende) produtos empilhados.
 */
export function FinancialPeriodChart({
  series,
  products = false,
  print = false,
}: {
  series: FinancialReport["series"];
  /** Mostra a série de Produtos (venda na comanda). */
  products?: boolean;
  /** Versão de impressão: sem animação (a folha sai com as barras inteiras). */
  print?: boolean;
}) {
  const keys = products ? WITH_PRODUCTS : BASE_KEYS;
  const rows: Row[] = series.points.map((point) => ({
    date: point.date,
    appointments: Number(point.appointments),
    packages: Number(point.packages),
    products: Number(point.products ?? 0),
  }));
  const empty = rows.every((row) => rowTotal(row) === 0);

  return (
    <section
      aria-labelledby="financial-period-title"
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4 print:break-inside-avoid"
    >
      <div>
        <h2 id="financial-period-title" className="font-semibold">
          Recebido no período
        </h2>
        <p className="text-sm text-muted-foreground">
          Por {series.unit === "week" ? "semana" : "dia"}, pela data do
          pagamento.
          <span className="print:hidden">
            {" "}
            Toque ou passe o mouse nas barras para ver os valores.
          </span>
        </p>
      </div>

      {empty ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum pagamento recebido no período.
        </p>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-44 w-full sm:h-52"
          // Leitor de tela: os cartões e o extrato trazem os mesmos valores.
          aria-label="Gráfico de barras do recebido no período"
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
              content={<TooltipBody unit={series.unit} keys={keys} />}
            />
            {keys.map((key, index) => (
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
                radius={index === keys.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ChartContainer>
      )}
      {!empty && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {keys.map((key) => (
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
