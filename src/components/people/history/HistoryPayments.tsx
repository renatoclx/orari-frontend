import { PaymentBadge } from "@/components/client-plans/ClientPlanParts";
import { EmptyValue } from "@/components/shared/EmptyValue";
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
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {payments.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            Nenhum pagamento deste cliente.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Vencimento", "Descrição", "Valor", "Situação"].map(
                  (title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
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
            </tbody>
          </table>
        )}
      </div>
      {footer}
    </div>
  );
}
