import Link from "next/link";
import { CalendarClock, CircleAlert, CircleCheck } from "lucide-react";
import {
  DEFAULT_PAYMENT_FILTER,
  paymentQuery,
  type PaymentFilterId,
  type PaymentFiltersState,
} from "@/components/payments/payment-filters";
import type { PaymentSummary } from "@/types/payment";
import { formatPrice } from "@/utils/format";
import { cn } from "cn";

// Cada situação tem ícone e cor próprios, para os cartões não se confundirem:
// atrasado em vermelho, recebido em verde e a vencer neutro (ainda não é nada).
const CARDS: {
  key: keyof PaymentSummary;
  label: string;
  icon: typeof CircleAlert;
  /** Situação que o clique aplica na listagem. */
  filter: PaymentFilterId;
  /** Faixa à esquerda, círculo do ícone e valor; o fundo tingido marca o cartão ativo. */
  barClass: string;
  iconClass: string;
  valueClass: string;
  activeClass: string;
}[] = [
  {
    key: "overdue",
    label: "Atrasado",
    icon: CircleAlert,
    filter: "atrasados",
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
    label: "Recebido",
    icon: CircleCheck,
    filter: "pagos",
    barClass: "bg-success",
    iconClass: "bg-success/15 text-success",
    valueClass: "text-success",
    activeClass: "bg-success/5",
  },
];

/**
 * Totais acima da listagem. Respeitam o cliente e o vencimento do filtro, mas
 * não a situação: cada cartão é um atalho para ela (screens/financeiro.md).
 */
export function PaymentsSummary({
  summary,
  filters,
}: {
  summary: PaymentSummary;
  filters: PaymentFiltersState;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CARDS.map((card) => {
        const { total, count } = summary[card.key];
        const active = filters.status === card.filter;
        // Clicar no cartão ativo desfaz o filtro e volta ao padrão (pendentes).
        const query = paymentQuery(filters, {
          status: active ? DEFAULT_PAYMENT_FILTER : card.filter,
        });
        const Icon = card.icon;
        return (
          <Link
            key={card.key}
            href={`/financeiro${query.size ? `?${query}` : ""}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-4 overflow-hidden rounded-card border border-border bg-card p-3 pl-5 transition-colors hover:bg-muted/50 sm:p-4 sm:pl-5",
              active && card.activeClass,
            )}
          >
            {/* Faixa na borda esquerda: a cor da situação, sem contornar o cartão. */}
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
                {formatPrice(total)}
              </span>
              <span className="block text-sm text-muted-foreground tabular-nums">
                {count} {count === 1 ? "pagamento" : "pagamentos"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
