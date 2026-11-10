import { Repeat, UserCheck, UserPlus, UserX } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { ClientsReport } from "@/types/clients-report";
import { formatPercent } from "@/utils/format";

// "1,5" com até uma casa.
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** Cartões do Perfil do cliente (screens/relatorio-perfil-cliente.md). */
export function ClientsReportCards({ report }: { report: ClientsReport }) {
  const ofBase = (count: number) =>
    report.clients > 0
      ? `${formatPercent(count / report.clients)} dos ${report.clients} clientes`
      : "Nenhum cliente cadastrado";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className={cardClass}>
        <Card
          icon={UserCheck}
          label="Clientes ativos"
          value={report.active}
          detail={ofBase(report.active)}
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={UserPlus}
          label="Novos no período"
          value={report.newClients}
          detail="Primeiro atendimento concluído"
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={UserX}
          label="Sem retorno"
          value={report.lapsed}
          detail="Há mais de 60 dias, sem nada marcado"
          // Vermelho só quando há.
          tone={report.lapsed > 0 ? "negative" : "neutral"}
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Repeat}
          label="Frequência média"
          value={
            report.frequency === null ? "--" : decimal.format(report.frequency)
          }
          detail={`Atendimentos por cliente (${report.attended} ${report.attended === 1 ? "atendido" : "atendidos"})`}
          tone="neutral"
        />
      </div>
    </div>
  );
}
