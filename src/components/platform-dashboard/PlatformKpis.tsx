import { CircleAlert, Repeat, Sparkles, Wallet } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass,
} from "@/components/shared/SummaryCard";
import type { PlatformDashboard } from "@/types/platform-dashboard";
import { formatPercent, formatPrice } from "@/utils/format";

/**
 * Os quatro números do topo: quanto entra por mês, quantas pagam, quanto o
 * teste converte e o que está em atraso.
 */
export function PlatformKpis({ data }: { data: PlatformDashboard }) {
  const { revenue, trialConversion, byStatus } = data;
  const trials =
    byStatus.find((item) => item.status === "TRIAL")?.companies ?? 0;
  const overdueCompanies =
    byStatus.find((item) => item.status === "OVERDUE")?.companies ?? 0;
  const discountCost = revenue.mrrWithoutDiscount - revenue.mrr;
  const conversion =
    trialConversion.ended > 0
      ? trialConversion.converted / trialConversion.ended
      : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className={summaryCardClass}>
        <Card
          icon={Wallet}
          label="Receita mensal (MRR)"
          value={formatPrice(revenue.mrr)}
          detail={
            discountCost > 0
              ? `${formatPrice(revenue.arr)}/ano · ${formatPrice(discountCost)} em descontos`
              : `${formatPrice(revenue.arr)} por ano`
          }
          tone="positive"
        />
      </div>
      <div className={summaryCardClass}>
        <Card
          icon={Repeat}
          label="Empresas pagantes"
          value={revenue.payingCompanies}
          detail={`${trials} em teste agora`}
          tone="neutral"
        />
      </div>
      <div className={summaryCardClass}>
        <Card
          icon={Sparkles}
          label="Conversão do teste"
          value={conversion === null ? "--" : formatPercent(conversion)}
          detail={
            trialConversion.ended > 0
              ? `${trialConversion.converted} de ${trialConversion.ended} testes encerrados`
              : "Nenhum teste encerrado ainda"
          }
          tone="neutral"
        />
      </div>
      <div className={summaryCardClass}>
        <Card
          icon={CircleAlert}
          label="Em atraso"
          value={formatPrice(revenue.overdueAmount)}
          detail={
            overdueCompanies === 1
              ? "1 empresa na tolerância"
              : `${overdueCompanies} empresas na tolerância`
          }
          tone={overdueCompanies > 0 ? "negative" : "neutral"}
        />
      </div>
    </div>
  );
}
