import { CalendarCheck, Package, Receipt, Wallet } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { FinancialReport, ReceivedTotal } from "@/types/financial-report";
import { formatPrice } from "@/utils/format";

const payments = (count: number) =>
  `${count} ${count === 1 ? "pagamento" : "pagamentos"}`;

/** Ticket médio de um total; "--" sem pagamentos. */
const average = ({ count, amount }: ReceivedTotal) =>
  count > 0 ? formatPrice(Number(amount) / count) : "--";

/** Cartões do relatório financeiro (screens/relatorio-financeiro.md). */
export function FinancialReportCards({ report }: { report: FinancialReport }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className={cardClass}>
        <Card
          icon={Wallet}
          label="Recebido"
          value={formatPrice(report.received.amount)}
          detail={payments(report.received.count)}
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Receipt}
          label="Ticket médio"
          value={average(report.received)}
          detail="Por pagamento recebido"
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={CalendarCheck}
          label="Atendimentos"
          value={formatPrice(report.appointments.amount)}
          detail={payments(report.appointments.count)}
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Package}
          label="Pacotes"
          value={formatPrice(report.packages.amount)}
          detail={payments(report.packages.count)}
          tone="neutral"
        />
      </div>
    </div>
  );
}
