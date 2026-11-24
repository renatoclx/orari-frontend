import { Ban, CalendarDays, CircleCheck, UserX } from "lucide-react";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { AppointmentReport } from "@/types/appointment-report";
import { formatPercent } from "@/utils/format";

/** Cartões do relatório de agendamentos (screens/relatorio-agendamentos.md). */
export function AppointmentReportCards({
  report,
}: {
  report: AppointmentReport;
}) {
  const happened = report.completed + report.noShow;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className={cardClass}>
        <Card
          icon={CalendarDays}
          label="Agendamentos"
          value={report.total}
          detail={
            <>
              <span className="block">{report.open} a acontecer</span>
              {report.fromPortal > 0 && (
                <span className="block">{report.fromPortal} pelo app</span>
              )}
            </>
          }
          tone="neutral"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={CircleCheck}
          label="Concluídos"
          value={report.completed}
          detail={
            happened > 0
              ? `${formatPercent(report.completed / happened)} dos que já passaram`
              : "Nenhum atendimento passou ainda"
          }
          tone="positive"
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={UserX}
          label="Faltas"
          value={report.noShow}
          detail={
            report.noShowRate === null
              ? "Sem base para a taxa"
              : `Taxa de falta ${formatPercent(report.noShowRate)}`
          }
          tone={report.noShow > 0 ? "negative" : "neutral"}
        />
      </div>
      <div className={cardClass}>
        <Card
          icon={Ban}
          label="Cancelados"
          value={report.cancelled}
          detail={
            report.cancelRate === null
              ? "Nenhum agendamento no período"
              : `${formatPercent(report.cancelRate)} de todos`
          }
          tone="neutral"
        />
      </div>
    </div>
  );
}
