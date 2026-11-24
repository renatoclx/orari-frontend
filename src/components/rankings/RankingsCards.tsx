import { CircleCheck, Package, Receipt, Wallet } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { Rankings } from "@/types/rankings";
import { formatPrice } from "@/utils/format";

/** Cartões dos Rankings (screens/rankings.md): os totais do período. */
export function RankingsCards({ summary }: { summary: Rankings["summary"] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className={cardClass}>
        <Card
          icon={Wallet}
          label="Faturado"
          value={formatPrice(summary.amount)}
          detail="Atendimentos concluídos"
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={CircleCheck}
          label="Concluídos"
          value={summary.completed}
          detail="Com as sessões de pacote"
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Receipt}
          label="Ticket médio"
          value={summary.average ? formatPrice(summary.average) : "--"}
          detail="Por atendimento com pagamento"
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Package}
          label="Pacotes contratados"
          value={formatPrice(summary.packages.amount)}
          detail={`${summary.packages.count} ${summary.packages.count === 1 ? "contratação" : "contratações"}`}
          tone="neutral"
        />
      </div>
    </div>
  );
}
