import type {
  BillingCycle,
  Subscription,
  SubscriptionInput,
  SubscriptionPlan,
} from "@/types/subscription";

/** O que o formulário guarda: texto como digitado; o valor em centavos (dígitos). */
export type SubscriptionFormValues = {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  extraProfessionals: string;
  anamnesisAddon: boolean;
  priceCents: string;
  discountPercent: string;
  discountUntil: string;
  trialEndsAt: string;
  paidUntil: string;
  canceledAt: string;
};

export type SubscriptionFormErrors = Partial<
  Record<keyof SubscriptionFormValues, string>
>;

/** Dias do teste grátis da empresa nova (docs/decisions.md). */
export const TRIAL_DAYS = 7;

// Data local "aaaa-mm-dd" daqui a N dias.
function isoInDays(days: number, from = new Date()): string {
  const date = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + days,
  );
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Valores iniciais: os da assinatura ou, sem ela, o Essencial mensal em teste
 * de 7 dias contando hoje (o último dia é hoje + 6).
 */
export function initialSubscriptionValues(
  subscription: Subscription | null,
  suggestedCents: (plan: SubscriptionPlan, cycle: BillingCycle) => number,
  today = new Date(),
): SubscriptionFormValues {
  if (!subscription) {
    return {
      plan: "ESSENTIAL",
      cycle: "MONTHLY",
      extraProfessionals: "0",
      anamnesisAddon: false,
      priceCents: String(suggestedCents("ESSENTIAL", "MONTHLY")),
      discountPercent: "",
      discountUntil: "",
      trialEndsAt: isoInDays(TRIAL_DAYS - 1, today),
      paidUntil: "",
      canceledAt: "",
    };
  }
  return {
    plan: subscription.plan,
    cycle: subscription.cycle,
    extraProfessionals: String(subscription.extraProfessionals),
    anamnesisAddon: subscription.anamnesisAddon,
    priceCents: String(Math.round(subscription.price * 100)),
    discountPercent:
      subscription.discountPercent === null
        ? ""
        : String(subscription.discountPercent),
    discountUntil: subscription.discountUntil ?? "",
    trialEndsAt: subscription.trialEndsAt ?? "",
    paidUntil: subscription.paidUntil ?? "",
    canceledAt: subscription.canceledAt ?? "",
  };
}

const isInteger = (text: string) => /^\d+$/.test(text.trim());

/** Confere o formulário; vazio = sem erros. As mesmas regras a API confere de novo. */
export function validateSubscriptionForm(
  values: SubscriptionFormValues,
): SubscriptionFormErrors {
  const errors: SubscriptionFormErrors = {};
  if (
    !isInteger(values.extraProfessionals) ||
    Number(values.extraProfessionals) > 99
  ) {
    errors.extraProfessionals = "Informe um número de 0 a 99.";
  }
  if (!(Number(values.priceCents) > 0)) {
    errors.priceCents = "Informe o valor do ciclo.";
  }
  if (values.discountPercent.trim()) {
    const percent = Number(values.discountPercent);
    if (!isInteger(values.discountPercent) || percent < 1 || percent > 100) {
      errors.discountPercent = "Informe um desconto de 1 a 100%.";
    } else if (!values.discountUntil) {
      errors.discountUntil = "Informe até quando vale o desconto.";
    }
  }
  if (!values.trialEndsAt && !values.paidUntil) {
    errors.paidUntil = "Informe o fim do teste ou até quando está pago.";
  }
  return errors;
}

export const hasErrors = (errors: SubscriptionFormErrors) =>
  Object.values(errors).some(Boolean);

/** Corpo do PUT; desconto vazio limpa o "até quando". */
export function toSubscriptionInput(
  values: SubscriptionFormValues,
): SubscriptionInput {
  const hasDiscount = values.discountPercent.trim() !== "";
  return {
    plan: values.plan,
    cycle: values.cycle,
    extraProfessionals: Number(values.extraProfessionals),
    anamnesisAddon: values.anamnesisAddon,
    price: Number(values.priceCents) / 100,
    discountPercent: hasDiscount ? Number(values.discountPercent) : null,
    discountUntil: hasDiscount ? values.discountUntil || null : null,
    trialEndsAt: values.trialEndsAt || null,
    paidUntil: values.paidUntil || null,
    canceledAt: values.canceledAt || null,
  };
}
