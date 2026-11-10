import { HandCoins, Percent, Wallet, WalletMinimal } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { CommissionSummary } from "@/types/commission";
import { formatPercent, formatPrice } from "@/utils/format";

/** Cartões das Comissões (screens/comissoes.md): os totais do período. */
export function CommissionsCards({ summary }: { summary: CommissionSummary }) {
  const base = Number(summary.base);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className={cardClass}>
        <Card
          icon={Percent}
          label="Comissão gerada"
          value={formatPrice(summary.amount)}
          detail={`${summary.count} ${summary.count === 1 ? "atendimento" : "atendimentos"} no período`}
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={HandCoins}
          label="Já pago pelos clientes"
          value={formatPrice(summary.clientPaid)}
          detail={
            base > 0
              ? `${formatPercent(Number(summary.clientPaid) / base)} da base`
              : "Nenhuma comissão no período"
          }
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={WalletMinimal}
          label="Adiantado"
          value={formatPrice(summary.advanced)}
          detail="Em aberto"
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Wallet}
          label="A pagar"
          value={formatPrice(summary.toPay)}
          detail="Em aberto, já sem o adiantado"
          tone="neutral"
        />
      </div>
    </div>
  );
}
