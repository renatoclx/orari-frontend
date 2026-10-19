import { ListChecks } from "lucide-react";
import { BILLING_LABEL } from "@/components/client-plans/client-plan-status";
import { formatPercent } from "@/components/plans/plan-pricing";
import { describeDays } from "@/components/recurrences/recurrence-schedule";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClientPlanItem } from "@/types/client-plan";
import type { PaymentItem } from "@/types/payment";
import { formatDateOnly, formatPrice } from "@/utils/format";

// Partes de exibição da contratação, usadas na página de detalhes e no diálogo
// aberto pela agenda.

const headerClass =
  "border-b border-border px-4 py-3 font-medium text-muted-foreground";

/** Dados e valores congelados da contratação. */
export function ClientPlanInfo({ item }: { item: ClientPlanItem }) {
  const rows: [string, React.ReactNode][] = [
    ["Cliente", item.client.name],
    ["Plano", item.plan.name],
    [
      "Período",
      `${formatDateOnly(item.startDate)} a ${formatDateOnly(item.endDate)} (${item.months} ${item.months === 1 ? "mês" : "meses"})`,
    ],
    ["Modalidade", BILLING_LABEL[item.billingType]],
    [
      "Valor mensal",
      `${formatPrice(item.monthlyAmount)} (desconto de ${formatPercent(item.discountPercent)})`,
    ],
    item.billingType === "MONTHLY"
      ? [
          "Total",
          `${item.months} × ${formatPrice(Number(item.totalAmount) / item.months)} = ${formatPrice(item.totalAmount)}`,
        ]
      : ["Total", `${formatPrice(item.totalAmount)} à vista`],
    [
      item.billingType === "MONTHLY" ? "Primeiro vencimento" : "Vencimento",
      item.firstDueDate && formatDateOnly(item.firstDueDate),
    ],
  ];
  if (item.cancelledAt) {
    rows.push(["Cancelada em", formatDateOnly(item.cancelledAt)]);
  }

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="tabular-nums">
            <EmptyValue>{value}</EmptyValue>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Agendas por serviço, com o botão de ver as sessões (em diálogo). */
export function ClientPlanSchedules({
  item,
  onViewSessions,
}: {
  item: ClientPlanItem;
  onViewSessions: (recurrenceId: string) => void;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          {["Serviço", "Profissional", "Dias e horários", ""].map((title) => (
            <th key={title} scope="col" className={headerClass}>
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {item.schedules.map((schedule) => (
          <tr key={schedule.id}>
            <td className="px-4 py-3 font-medium">{schedule.service.name}</td>
            <td className="px-4 py-3">{schedule.professional.name}</td>
            <td className="px-4 py-3">{describeDays(schedule.days)}</td>
            <td className="px-4 py-2 text-right">
              <Button
                type="button"
                variant="outline"
                onClick={() => onViewSessions(schedule.id)}
              >
                <ListChecks aria-hidden="true" />
                Ver sessões
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Situação da parcela: pendente com vencimento passado consta como atrasada.
function PaymentBadge({ payment }: { payment: PaymentItem }) {
  if (payment.status === "PAID") return <Badge variant="success">Paga</Badge>;
  if (payment.status === "CANCELLED") {
    return <Badge variant="secondary">Cancelada</Badge>;
  }
  return payment.isOverdue ? (
    <Badge variant="destructive">Atrasada</Badge>
  ) : (
    <Badge variant="outline">Pendente</Badge>
  );
}

/** Parcelas (só leitura; a baixa é feita no Financeiro). */
export function ClientPlanPayments({ payments }: { payments: PaymentItem[] }) {
  if (payments.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        Nenhum pagamento gerado.
      </p>
    );
  }
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          {["Parcela", "Vencimento", "Valor", "Situação"].map((title) => (
            <th key={title} scope="col" className={headerClass}>
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {payments.map((payment, index) => (
          <tr key={payment.id} className="tabular-nums">
            <td className="px-4 py-3">
              {index + 1} de {payments.length}
            </td>
            <td className="px-4 py-3">
              <EmptyValue>
                {payment.dueDate && formatDateOnly(payment.dueDate)}
              </EmptyValue>
            </td>
            <td className="px-4 py-3">{formatPrice(payment.amount)}</td>
            <td className="px-4 py-3">
              <PaymentBadge payment={payment} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
