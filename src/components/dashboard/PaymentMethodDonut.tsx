"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  methodSlices,
  type MethodSlice,
} from "@/components/dashboard/payment-method-slices";
import type { FinancialReportMethod } from "@/types/financial-report";
import { formatPercent, formatPrice } from "@/utils/format";

// As cores vêm de cada fatia (ordem do cadastro); o config só satisfaz o
// ChartContainer, que cuida do tamanho e do tema.
const config = {} satisfies ChartConfig;

function TooltipBody({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MethodSlice }[];
}) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice) return null;
  return (
    <div className="grid min-w-40 gap-1 rounded-overlay border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="flex items-center gap-1.5 font-medium">
        <span
          className="size-2.5 rounded-[2px]"
          style={{ background: slice.color }}
          aria-hidden="true"
        />
        {slice.label}
      </p>
      <p className="flex justify-between gap-4 tabular-nums">
        <span className="text-muted-foreground">
          {slice.count} {slice.count === 1 ? "pagamento" : "pagamentos"}
        </span>
        <span className="font-medium">{formatPrice(slice.amount)}</span>
      </p>
    </div>
  );
}

/**
 * Recebido por método de pagamento em rosca (Dashboard): poucas fatias, parte
 * do todo, com o total no centro. A legenda escreve valor e %, então a cor
 * nunca é a única informação.
 */
export function PaymentMethodDonut({
  methods,
  total,
  order,
}: {
  methods: FinancialReportMethod[];
  /** Recebido no período (texto com duas casas). */
  total: string;
  /** Ids dos métodos da empresa, na ordem do cadastro (dá a cor). */
  order: string[];
}) {
  const slices = methodSlices(methods, order);

  return (
    <section
      aria-labelledby="payment-method-donut-title"
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4"
    >
      <div>
        <h2 id="payment-method-donut-title" className="font-semibold">
          Por método de pagamento
        </h2>
        <p className="text-sm text-muted-foreground">
          Parte do recebido no período.
        </p>
      </div>

      {slices.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum pagamento recebido no período.
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row">
          <div className="relative size-44 shrink-0">
            <ChartContainer
              config={config}
              className="aspect-square size-44"
              // Leitor de tela: a legenda ao lado traz os mesmos números.
              aria-label="Gráfico de rosca do recebido por método de pagamento"
              role="img"
            >
              <PieChart>
                <ChartTooltip content={<TooltipBody />} />
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="100%"
                  // Fresta da cor do cartão entre as fatias.
                  stroke="var(--card)"
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            {/* O total no centro, por cima do gráfico (não recebe o mouse). */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted-foreground">Recebido</span>
              <span className="text-sm font-semibold tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <ul className="grid w-full min-w-0 gap-2 text-sm">
            {slices.map((slice) => (
              <li
                key={slice.key}
                className="flex items-center justify-between gap-3 tabular-nums"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ background: slice.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{slice.label}</span>
                </span>
                <span className="whitespace-nowrap">
                  {formatPrice(slice.amount)}{" "}
                  <span className="text-muted-foreground">
                    ({formatPercent(slice.share)})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
