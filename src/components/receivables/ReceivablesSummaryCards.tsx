import Link from "next/link";
import { CircleAlert, CircleCheck, Percent, Wallet } from "lucide-react";
import { overduePaymentsHref } from "@/components/receivables/receivables-filters";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { ReceivablesSummary } from "@/types/receivables";
import { formatPrice } from "@/utils/format";
import { cn } from "cn";

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

// "12,5%": uma casa só quando ajuda (abaixo de 10%).
const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

/**
 * Cartões do resumo (screens/analise-de-recebiveis.md). A receber e Atrasado são
 * atalhos para Contas a receber (Financeiro); recebido e inadimplência valem para o período.
 */
export function ReceivablesSummaryCards({
  summary,
}: {
  summary: ReceivablesSummary;
}) {
  const linkClass = "transition-colors hover:bg-muted/50";
  const { rate } = summary.default;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Link href="/pagamentos" className={cn(cardClass, linkClass)}>
        <Card
          icon={Wallet}
          label="A receber"
          value={formatPrice(summary.open.total)}
          detail={plural(
            summary.open.count,
            "pagamento pendente",
            "pagamentos pendentes",
          )}
          tone="neutral"
        />
      </Link>
      <Link href={overduePaymentsHref()} className={cn(cardClass, linkClass)}>
        <Card
          icon={CircleAlert}
          label="Atrasado"
          value={formatPrice(summary.overdue.total)}
          detail={plural(summary.overdue.clients, "cliente", "clientes")}
          tone="negative"
        />
      </Link>
      <div className={cardClass}>
        <Card
          icon={CircleCheck}
          label="Recebido no período"
          value={formatPrice(summary.received.total)}
          detail={plural(summary.received.count, "pagamento", "pagamentos")}
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Percent}
          label="Inadimplência"
          value={rate === null ? "--" : percent.format(rate)}
          detail={
            rate === null
              ? "Nada venceu no período"
              : `${formatPrice(summary.default.unpaid)} de ${formatPrice(summary.default.due)}`
          }
          tone={rate ? "negative" : "neutral"}
        />
      </div>
    </div>
  );
}
