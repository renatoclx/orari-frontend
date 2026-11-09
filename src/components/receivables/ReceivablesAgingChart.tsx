import { AGING_LABELS } from "@/components/receivables/receivables-filters";
import type { ReceivablesSummary } from "@/types/receivables";
import { formatPrice } from "@/utils/format";
import { cn } from "cn";

// Um tom só, mais escuro quanto mais antigo (tokens validados no globals.css).
const AGING_COLORS = {
  "1-30": "bg-chart-aging-1",
  "31-60": "bg-chart-aging-2",
  "61-90": "bg-chart-aging-3",
  "90+": "bg-chart-aging-4",
} as const;

/**
 * Atrasados por idade (screens/contas-a-receber.md): uma barra por faixa de
 * dias, com o valor e a quantidade escritos ao lado (não depende da cor nem
 * do mouse). A cor escurece com a idade do atraso, do laranja ao vinho.
 */
export function ReceivablesAgingChart({
  aging,
}: {
  aging: ReceivablesSummary["aging"];
}) {
  const max = Math.max(...aging.map((bucket) => Number(bucket.total)));

  return (
    <section
      aria-labelledby="receivables-aging-title"
      className="flex flex-col gap-4 rounded-card border border-border bg-card p-4"
    >
      <div>
        <h2 id="receivables-aging-title" className="font-semibold">
          Atrasados por tempo de atraso
        </h2>
        <p className="text-sm text-muted-foreground">
          Quanto mais antigo, mais difícil de receber.
        </p>
      </div>

      {max === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">
          Nenhum pagamento atrasado.
        </p>
      ) : (
        <ul className="grid gap-3 text-sm">
          {aging.map((bucket) => (
            <li key={bucket.key} className="grid gap-1">
              <span className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {AGING_LABELS[bucket.key]}
                </span>
                <span className="font-medium tabular-nums">
                  {formatPrice(bucket.total)}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({bucket.count})
                  </span>
                </span>
              </span>
              <span className="h-3 rounded-[4px] bg-muted" aria-hidden="true">
                <span
                  className={cn(
                    "block h-full rounded-[4px]",
                    AGING_COLORS[bucket.key],
                  )}
                  style={{ width: `${(Number(bucket.total) / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
