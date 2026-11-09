import type { CheckoutAppointment, CheckoutItem } from "@/types/payment";

/**
 * Situação de uma comanda na listagem:
 * - `open`: há valor pendente (de hoje ou anterior), dá para receber;
 * - `awaiting`: nada pendente, mas há atendimento avulso sem cobrança ainda
 *   (ela só nasce quando o atendimento é concluído);
 * - `paid`: nada pendente nem aguardando, e algo foi pago;
 * - `package`: só sessões de pacote, que não têm cobrança própria.
 */
export type CheckoutState = "open" | "awaiting" | "paid" | "package";

/**
 * Decide a situação da comanda, nesta ordem (a primeira que valer). A ordem
 * evita dizer "Paga" quando um atendimento ainda não foi concluído. A regra é
 * só do frontend: a API não devolve um status por comanda.
 */
export function checkoutState(checkout: CheckoutItem): CheckoutState {
  const { appointments, previousPayments } = checkout;

  if (Number(checkout.todayPending) + Number(checkout.previousPending) > 0) {
    return "open";
  }

  // Avulso sem pagamento: ainda não concluído. Sessão de pacote não conta.
  // Comanda sem nada (não deveria existir) também cai aqui: neutra, sem botão
  // de receber, e nunca "Paga".
  const awaiting =
    appointments.length === 0 && previousPayments.length === 0
      ? true
      : appointments.some(
          (appointment) =>
            appointment.payment === null && appointment.clientPlanId === null,
        );
  if (awaiting) return "awaiting";

  const hasPaid =
    appointments.some(
      (appointment) => appointment.payment?.status === "PAID",
    ) || previousPayments.some((payment) => payment.status === "PAID");
  if (hasPaid) return "paid";

  // Sobrou só sessão de pacote.
  return "package";
}

/**
 * Atendimento que dá para receber antes da conclusão: avulso ainda sem
 * pagamento e com preço no serviço (é o valor cobrado). A API confere de novo.
 */
export function receivableAhead(appointment: CheckoutAppointment): boolean {
  return (
    appointment.payment === null &&
    appointment.clientPlanId === null &&
    appointment.service.price !== null
  );
}

/** A comanda tem o que receber: pendência ou atendimento a receber antes. */
export function canReceive(checkout: CheckoutItem): boolean {
  return (
    checkoutState(checkout) === "open" ||
    checkout.appointments.some(receivableAhead)
  );
}
