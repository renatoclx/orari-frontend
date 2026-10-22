import { Package, Repeat } from "lucide-react";
import type { PaymentItem } from "@/types/payment";
import { formatDateOnly } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

/** Descrição pela origem: o atendimento (serviço, dia e hora) ou o pacote. */
export function describePayment(
  payment: PaymentItem,
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
  return "Pagamento";
}

/** Descrição com o ícone da origem: recorrência ou pacote (os mesmos da agenda). */
export function PaymentDescription({
  payment,
  timeZone,
}: {
  payment: PaymentItem;
  timeZone: string;
}) {
  const Icon = payment.clientPlan
    ? Package
    : payment.appointment?.recurringAppointmentId
      ? Repeat
      : null;

  return (
    <span className="inline-flex items-center gap-1.5">
      {Icon && (
        <Icon
          className="size-4 shrink-0 text-muted-foreground"
          aria-label={payment.clientPlan ? "Pacote" : "Recorrência"}
        />
      )}
      {describePayment(payment, timeZone)}
    </span>
  );
}
