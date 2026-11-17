import type {
  PaymentSuggestion,
  SubscriptionPaymentInput,
  SubscriptionPaymentMethod,
} from "@/types/subscription-payment";

// Formulário de pagamento da assinatura (screens/cobrancas.md).

export const PAYMENT_METHODS: {
  key: SubscriptionPaymentMethod;
  label: string;
}[] = [
  { key: "PIX", label: "Pix" },
  { key: "CARD", label: "Cartão" },
  { key: "BOLETO", label: "Boleto" },
  { key: "TRANSFER", label: "Transferência" },
  { key: "CASH", label: "Dinheiro" },
  { key: "OTHER", label: "Outra" },
];

export const methodLabel = (method: SubscriptionPaymentMethod) =>
  PAYMENT_METHODS.find((item) => item.key === method)?.label ?? method;

/** Texto como digitado; o valor em centavos (dígitos), como no MaskedInput. */
export type PaymentFormValues = {
  amountCents: string;
  paidAt: string;
  method: SubscriptionPaymentMethod;
  periodStart: string;
  periodEnd: string;
  note: string;
};

export type PaymentFormErrors = Partial<
  Record<keyof PaymentFormValues, string>
>;

/** Valores iniciais: a sugestão da API (período e valor), pago hoje, no Pix. */
export function initialPaymentValues(
  suggestion: PaymentSuggestion | null,
  todayIso: string,
): PaymentFormValues {
  return {
    amountCents: suggestion ? String(Math.round(suggestion.amount * 100)) : "",
    paidAt: todayIso,
    method: "PIX",
    periodStart: suggestion?.periodStart ?? "",
    periodEnd: suggestion?.periodEnd ?? "",
    note: "",
  };
}

export function validatePaymentForm(
  values: PaymentFormValues,
): PaymentFormErrors {
  const errors: PaymentFormErrors = {};
  if (!(Number(values.amountCents) > 0))
    errors.amountCents = "Informe o valor.";
  if (!values.paidAt) errors.paidAt = "Informe a data do pagamento.";
  if (!values.periodStart) errors.periodStart = "Informe o início do período.";
  if (!values.periodEnd) {
    errors.periodEnd = "Informe o fim do período.";
  } else if (values.periodStart && values.periodEnd < values.periodStart) {
    errors.periodEnd = "O fim não pode ser antes do início.";
  }
  return errors;
}

export function toPaymentInput(
  values: PaymentFormValues,
): SubscriptionPaymentInput {
  return {
    amount: Number(values.amountCents) / 100,
    paidAt: values.paidAt,
    method: values.method,
    periodStart: values.periodStart,
    periodEnd: values.periodEnd,
    note: values.note.trim() || null,
  };
}

/** "aaaa-mm" do mês anterior ou seguinte (navegação da tela Cobranças). */
export function shiftMonth(month: string, delta: number): string {
  const date = new Date(
    Date.UTC(
      Number(month.slice(0, 4)),
      Number(month.slice(5, 7)) - 1 + delta,
      1,
    ),
  );
  return date.toISOString().slice(0, 7);
}
