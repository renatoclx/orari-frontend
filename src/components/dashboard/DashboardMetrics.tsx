import {
  CalendarCheck,
  CircleAlert,
  UserCheck,
  UserPlus,
  UserX,
  Wallet,
} from "lucide-react";
import {
  changeText,
  rateChangeText,
} from "@/components/dashboard/dashboard-filters";
import {
  SummaryCardContent as Card,
  summaryCardClass as cardClass,
} from "@/components/shared/SummaryCard";
import type { AppointmentReport } from "@/types/appointment-report";
import type { ClientsReport } from "@/types/clients-report";
import type { FinancialReport } from "@/types/financial-report";
import type { ReceivablesSummary } from "@/types/receivables";
import { formatPercent, formatPrice } from "@/utils/format";

/** Um relatório do período e o mesmo no período anterior. */
type Compared<T> = { current: T; previous: T } | null;

type DashboardMetricsProps = {
  /** "mês anterior" ou "período anterior". */
  label: string;
  financial: Compared<FinancialReport>;
  appointments: Compared<AppointmentReport>;
  clients: Compared<ClientsReport>;
  /** A situação de hoje (sem comparação). */
  receivables: ReceivablesSummary | null;
};

/**
 * As métricas do topo, só dos relatórios que a empresa tem. As do período
 * comparam com o anterior; as de hoje (ativos, atraso), não.
 */
export function DashboardMetrics({
  label,
  financial,
  appointments,
  clients,
  receivables,
}: DashboardMetricsProps) {
  const cards: React.ReactNode[] = [];

  if (financial) {
    cards.push(
      <Card
        key="received"
        icon={Wallet}
        label="Recebido"
        value={formatPrice(financial.current.received.amount)}
        detail={changeText(
          Number(financial.current.received.amount),
          Number(financial.previous.received.amount),
          label,
        )}
        tone="positive"
      />,
    );
  }
  if (appointments) {
    cards.push(
      <Card
        key="completed"
        icon={CalendarCheck}
        label="Atendimentos concluídos"
        value={appointments.current.completed}
        detail={changeText(
          appointments.current.completed,
          appointments.previous.completed,
          label,
        )}
        tone="neutral"
      />,
      <Card
        key="no-show"
        icon={UserX}
        label="Taxa de falta"
        value={
          appointments.current.noShowRate === null
            ? "--"
            : formatPercent(appointments.current.noShowRate)
        }
        detail={rateChangeText(
          appointments.current.noShowRate,
          appointments.previous.noShowRate,
          label,
        )}
        // Vermelho só quando há falta.
        tone={appointments.current.noShow > 0 ? "negative" : "neutral"}
      />,
    );
  }
  if (clients) {
    cards.push(
      <Card
        key="new"
        icon={UserPlus}
        label="Clientes novos"
        value={clients.current.newClients}
        detail={changeText(
          clients.current.newClients,
          clients.previous.newClients,
          label,
        )}
        tone="neutral"
      />,
      <Card
        key="active"
        icon={UserCheck}
        label="Clientes ativos hoje"
        value={clients.current.active}
        detail={
          clients.current.clients > 0
            ? `${formatPercent(clients.current.active / clients.current.clients)} dos ${clients.current.clients} clientes`
            : "Nenhum cliente cadastrado"
        }
        tone="neutral"
      />,
    );
  }
  if (receivables) {
    const { overdue } = receivables;
    cards.push(
      <Card
        key="overdue"
        icon={CircleAlert}
        label="Em atraso hoje"
        value={formatPrice(overdue.total)}
        detail={`${overdue.clients} ${overdue.clients === 1 ? "cliente" : "clientes"}`}
        tone={Number(overdue.total) > 0 ? "negative" : "neutral"}
      />,
    );
  }

  if (cards.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card, index) => (
        <div key={index} className={cardClass}>
          {card}
        </div>
      ))}
    </div>
  );
}
