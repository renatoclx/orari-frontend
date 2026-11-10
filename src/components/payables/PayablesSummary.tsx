import Link from "next/link";
import { CalendarClock, CircleAlert, CircleCheck } from "lucide-react";
import {
  DEFAULT_PAYABLE_FILTER,
  PAYABLES_PATH,
  payableQuery,
  type PayableFilterId,
  type PayableFiltersState,
} from "@/components/payables/payable-filters";
import type { PayableSummary } from "@/types/payable";
import { formatPrice } from "@/utils/format";
import { cn } from "cn";

// Mesmo desenho dos cartões do Contas a receber: atrasado em vermelho, a vencer
// neutro e pago em verde; cada cartão é um atalho para a situação.
const CARDS: {
  key: keyof PayableSummary;
  label: string;
  icon: typeof CircleAlert;
  filter: PayableFilterId;
  barClass: string;
  iconClass: string;
  valueClass: string;
  activeClass: string;
}[] = [
  {
    key: "overdue",
    label: "Atrasado",
    icon: CircleAlert,
    filter: "atrasadas",
    barClass: "bg-destructive",
    iconClass: "bg-destructive/10 text-destructive dark:text-red-400",
    valueClass: "text-destructive dark:text-red-400",
    activeClass: "bg-destructive/5",
  },
  {
    key: "upcoming",
    label: "A vencer",
    icon: CalendarClock,
    filter: "a-vencer",
    barClass: "bg-muted-foreground",
    iconClass: "bg-muted text-foreground",
    valueClass: "",
    activeClass: "bg-muted/60",
  },
  {
    key: "paid",
    label: "Pago",
    icon: CircleCheck,
    filter: "pagas",
    barClass: "bg-success",
    iconClass: "bg-success/15 text-success",
    valueClass: "text-success",
    activeClass: "bg-success/5",
  },
];

/** Totais acima da lista (respeitam favorecido, categoria e vencimento). */
export function PayablesSummary({
  summary,
  filters,
}: {
  summary: PayableSummary;
  filters: PayableFiltersState;
}) {
  return (
    <div className="hidden gap-3 sm:grid sm:grid-cols-3">
      {CARDS.map((card) => {
        const { amount, count } = summary[card.key];
        const active = filters.status === card.filter;
        // Clicar no cartão ativo volta ao padrão (pendentes).
        const query = payableQuery(filters, {
          status: active ? DEFAULT_PAYABLE_FILTER : card.filter,
        });
        const Icon = card.icon;
        return (
          <Link
            key={card.key}
            href={`${PAYABLES_PATH}${query.size ? `?${query}` : ""}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-4 overflow-hidden rounded-card border border-border bg-card p-3 pl-5 transition-colors hover:bg-muted/50 sm:p-4 sm:pl-5",
              active && card.activeClass,
            )}
          >
            <span
              className={cn("absolute inset-y-0 left-0 w-1.5", card.barClass)}
              aria-hidden="true"
            />
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full sm:size-11",
                card.iconClass,
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
              <span
                className={cn(
                  "block text-xl font-semibold tabular-nums sm:text-2xl",
                  card.valueClass,
                )}
              >
                {formatPrice(amount)}
              </span>
              <span className="block text-sm text-muted-foreground tabular-nums">
                {count} {count === 1 ? "conta" : "contas"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
