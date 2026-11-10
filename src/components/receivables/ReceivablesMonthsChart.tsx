"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ReceivablesSummary } from "@/types/receivables";
import { formatPrice } from "@/utils/format";

// Cores pelos tokens de gráfico (trocam sozinhas no tema escuro). O índigo
// fica entre o verde e o vermelho na pilha, que se confundem para parte dos
// daltônicos.
const config = {
  paid: { label: "Recebido", color: "var(--chart-positive)" },
  upcoming: { label: "A vencer", color: "var(--chart-info)" },
  overdue: { label: "Atrasado", color: "var(--chart-negative)" },
} satisfies ChartConfig;
const KEYS = ["paid", "upcoming", "overdue"] as const;

// "nov/26" (eixo) ou "novembro de 2026" (dica), a partir de "2026-11".
const monthLabel = (month: string, long = false) => {
  const text = new Intl.DateTimeFormat("pt-BR", {
    month: long ? "long" : "short",
    year: long ? "numeric" : "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
  return long ? text : text.replace(". de ", "/");
};

// Eixo em reais sem centavos, curto ("R$ 1,2 mil").
const axisMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

type Row = { month: string; paid: number; upcoming: number; overdue: number };

function TooltipBody({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="grid min-w-44 gap-1.5 rounded-overlay border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium first-letter:uppercase">
        {monthLabel(row.month, true)}
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
          <span className="font-medium tabular-nums">
            {formatPrice(row[key])}
          </span>
        </p>
      ))}
    </div>
  );
}

/**
 * Mês a mês pelo vencimento (screens/analise-de-recebiveis.md): recebido, a vencer
 * e atrasado empilhados, nos 6 meses até o atual e nos 3 seguintes.
 */
export function ReceivablesMonthsChart({
  months,
  print = false,
}: {
  months: ReceivablesSummary["months"];
  /** Versão de impressão: sem animação (a folha sai com as barras inteiras). */
  print?: boolean;
}) {
  const rows: Row[] = months.map((point) => ({
    month: point.month,
    paid: Number(point.paid),
    upcoming: Number(point.upcoming),
    overdue: Number(point.overdue),
  }));
  const empty = rows.every(
    (row) => row.paid + row.upcoming + row.overdue === 0,
  );

  return (
    <section
      aria-labelledby="receivables-months-title"
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4"
    >
      <div>
        <h2 id="receivables-months-title" className="font-semibold">
          Mês a mês
        </h2>
        <p className="text-sm text-muted-foreground">
          Pelo vencimento, nos últimos 6 meses e nos próximos 3.
          <span className="print:hidden">
            {" "}
            Toque ou passe o mouse nas barras para ver os valores.
          </span>
        </p>
      </div>

      {empty ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum pagamento com vencimento nesses meses.
        </p>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto h-44 w-full sm:h-52"
          // Leitor de tela: os cartões e a lista trazem os mesmos números.
          aria-label="Gráfico de barras dos pagamentos mês a mês"
          role="img"
        >
          <BarChart data={rows} margin={{ left: 4, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
              tickFormatter={(month: string) => monthLabel(month)}
            />
            <YAxis
              width={64}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => axisMoney.format(value)}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<TooltipBody />}
            />
            {KEYS.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="total"
                fill={`var(--color-${key})`}
                stroke="var(--card)"
                strokeWidth={1}
                maxBarSize={40}
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
