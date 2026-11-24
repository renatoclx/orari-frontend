import { Package, Repeat, ShoppingBag } from "lucide-react";
import type { PaymentItem } from "@/types/payment";
import { formatDateOnly } from "@/utils/format";
import { saleDescription } from "@/utils/sale";
import { toDateString, toTimeString } from "@/utils/time";

// O que a descrição lê da origem (a venda é opcional para quem monta à mão).
type PaymentOrigin = Pick<PaymentItem, "appointment" | "clientPlan"> &
  Partial<Pick<PaymentItem, "productSale">>;

/** Descrição pela origem: o atendimento (serviço, dia e hora), o pacote ou a venda. */
export function describePayment(
  payment: PaymentOrigin,
  timeZone: string,
): string {
  if (payment.appointment) {
    const { startAt, service } = payment.appointment;
    const date = toDateString(new Date(startAt), timeZone);
    return `${service.name} · ${formatDateOnly(`${date}T00:00:00Z`)} às ${toTimeString(startAt, timeZone)}`;
  }
  if (payment.clientPlan) {
    const { plan, billingType } = payment.clientPlan;
    return `Pacote ${plan.name} · ${billingType === "INTEGRAL" ? "pagamento integral" : "parcela"}`;
  }
  if (payment.productSale) {
    return `Venda: ${saleDescription(payment.productSale.items)}`;
  }
  return "Pagamento";
}

/** Descrição com o ícone da origem: recorrência, pacote (os da agenda) ou venda. */
export function PaymentDescription({
  payment,
  timeZone,
}: {
  payment: PaymentOrigin;
  timeZone: string;
}) {
  const Icon = payment.clientPlan
    ? Package
    : payment.productSale
      ? ShoppingBag
      : payment.appointment?.recurringAppointmentId
        ? Repeat
        : null;
  const iconLabel = payment.clientPlan
    ? "Pacote"
    : payment.productSale
      ? "Venda de produtos"
      : "Recorrência";

  return (
    <span className="inline-flex items-center gap-1.5">
      {Icon && (
        <Icon
          className="size-4 shrink-0 text-muted-foreground"
          aria-label={iconLabel}
        />
      )}
      {describePayment(payment, timeZone)}
    </span>
  );
}
