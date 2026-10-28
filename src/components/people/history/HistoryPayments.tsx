import { PaymentBadge } from "@/components/client-plans/ClientPlanParts";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { ListCard } from "@/components/shared/ListCard";
import type { PaymentItem } from "@/types/payment";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

type HistoryPaymentsProps = {
  payments: PaymentItem[];
  timeZone: string;
  footer: React.ReactNode;
};

// Descrição pela origem: o atendimento (serviço, data e hora) ou a parcela do pacote.
function describe(payment: PaymentItem, timeZone: string): string | null {
  if (payment.appointment) {
    const { startAt, service } = payment.appointment;
    const date = toDateString(new Date(startAt), timeZone);
    return `${service.name} · ${formatDateOnly(`${date}T00:00:00Z`)} às ${toTimeString(startAt, timeZone)}`;
  }
  if (payment.clientPlan) return `Pacote ${payment.clientPlan.plan.name}`;
  return null;
}

/** Pagamentos do cliente (só leitura; a baixa é feita no Financeiro). */
export function HistoryPayments({
  payments,
  timeZone,
  footer,
}: HistoryPaymentsProps) {
  return (
    <ListCard
      columns={["Vencimento", "Descrição", "Valor", "Situação"]}
      emptyMessage={
        payments.length === 0 ? "Nenhum pagamento deste cliente." : undefined
      }
      cards={payments.map((payment) => (
        <li
          key={payment.id}
          className="flex items-center justify-between gap-2 p-4"
        >
          <div className="min-w-0 space-y-0.5 text-sm tabular-nums">
            <p className="font-medium">
              <EmptyValue>{describe(payment, timeZone)}</EmptyValue>
            </p>
            <p className="text-muted-foreground">
              Vence em{" "}
              <EmptyValue>
                {payment.dueDate && formatDateOnly(payment.dueDate)}
              </EmptyValue>{" "}
              · {formatPrice(payment.amount)}
            </p>
          </div>
          <PaymentBadge payment={payment} feminine={false} />
        </li>
      ))}
      rows={payments.map((payment) => (
        <tr key={payment.id} className="tabular-nums">
          <td className="px-4 py-3 whitespace-nowrap">
            <EmptyValue>
              {payment.dueDate && formatDateOnly(payment.dueDate)}
            </EmptyValue>
          </td>
          <td className="px-4 py-3">
            <EmptyValue>{describe(payment, timeZone)}</EmptyValue>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatPrice(payment.amount)}
          </td>
          <td className="px-4 py-3">
            <PaymentBadge payment={payment} feminine={false} />
          </td>
        </tr>
      ))}
      footer={footer}
    />
  );
}
