import {
  NO_METHOD_LABEL,
  ORIGIN_LABELS,
} from "@/components/financial-report/financial-report-filters";
import { ListCard } from "@/components/shared/ListCard";
import type { ReceivedItem } from "@/types/financial-report";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

type ReceivedPaymentListProps = {
  payments: ReceivedItem[];
  /** Fuso da empresa: a data do pagamento é o dia dela. */
  timeZone: string;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

/** "10/11/2026" no dia da empresa. */
export function paidDay(paidAt: string, timeZone: string) {
  return formatDateOnly(
    `${toDateString(new Date(paidAt), timeZone)}T00:00:00Z`,
  );
}

/** "Pacote · Pilates 3x" */
export function originText(payment: ReceivedItem) {
  return `${ORIGIN_LABELS[payment.origin]} · ${payment.description}`;
}

/** Extrato do recebido (screens/relatorio-financeiro.md), o mais recente primeiro. */
export function ReceivedPaymentList({
  payments,
  timeZone,
  footer,
}: ReceivedPaymentListProps) {
  const method = (payment: ReceivedItem) =>
    payment.method?.name ?? NO_METHOD_LABEL;

  return (
    <ListCard
      toolbar={
        <h2 className="border-b border-border px-4 py-3 font-semibold">
          Extrato
        </h2>
      }
      scrollLabel="Pagamentos recebidos"
      columns={["Data", "Cliente", "Origem", "Método", "Valor"]}
      emptyMessage={
        payments.length > 0
          ? undefined
          : "Nenhum pagamento recebido no período."
      }
      rows={payments.map((payment) => (
        <tr key={payment.id} className="tabular-nums hover:bg-background">
          <td className="px-4 py-3 whitespace-nowrap">
            {paidDay(payment.paidAt, timeZone)}
          </td>
          <td className="px-4 py-3 font-medium">{payment.client.name}</td>
          <td className="px-4 py-3">{originText(payment)}</td>
          <td className="px-4 py-3 whitespace-nowrap">{method(payment)}</td>
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {formatPrice(payment.amount)}
          </td>
        </tr>
      ))}
      cards={payments.map((payment) => (
        <li key={payment.id} className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium">{payment.client.name}</span>
            <span className="font-semibold whitespace-nowrap tabular-nums">
              {formatPrice(payment.amount)}
            </span>
          </div>
          <p className="text-sm">{originText(payment)}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {paidDay(payment.paidAt, timeZone)} · {method(payment)}
          </p>
        </li>
      ))}
      footer={footer}
    />
  );
}
