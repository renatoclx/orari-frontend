import { CalendarClock, FileSignature, Package, PackageX } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { PackagesReport } from "@/types/packages-report";
import { formatPrice } from "@/utils/format";

/** Cartões do relatório de pacotes (screens/relatorio-pacotes.md). */
export function PackagesReportCards({ report }: { report: PackagesReport }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className={cardClass}>
        <Card
          icon={FileSignature}
          label="Contratações novas"
          value={report.created.count}
          detail={`${formatPrice(report.created.amount)} contratados`}
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Package}
          label="Ativas hoje"
          value={report.active}
          detail="Dentro do período contratado"
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={PackageX}
          label="Canceladas"
          value={report.cancelled}
          detail="No período"
          // Vermelho só quando há cancelamento.
          tone={report.cancelled > 0 ? "negative" : "neutral"}
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={CalendarClock}
          label="Terminando em 30 dias"
          value={report.ending}
          detail={
            report.ending > 0 ? "Sem renovação ainda" : "Nenhuma para renovar"
          }
          tone="neutral"
        />
      </div>
    </div>
  );
}
