import { CalendarCheck, HandCoins, Percent } from "lucide-react";
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
    <div className="grid gap-3 sm:grid-cols-3">
      <div className={cardClass}>
        <Card
          icon={Percent}
          label="Comissão gerada"
          value={formatPrice(summary.amount)}
          detail={`Sobre ${formatPrice(summary.base)} de base`}
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
          icon={CalendarCheck}
          label="Atendimentos"
          value={summary.count}
          detail="Concluídos com comissão"
          tone="neutral"
        />
      </div>
    </div>
  );
}
