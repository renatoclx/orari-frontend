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
  // O "pago até" muda pelos pagamentos; sem ele, o teste precisa de um fim.
  if (!values.trialEndsAt && !values.paidUntil) {
    errors.trialEndsAt = "Informe o último dia do teste grátis.";
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

// Datas "aaaa-mm-dd" sem passar por fuso (contas de calendário).
function shiftIso(iso: string, days: number, months = 0): string {
  const [year, month, day] = iso.split("-").map(Number);
  const lastDay = new Date(
    Date.UTC(year, month - 1 + months + 1, 0),
  ).getUTCDate();
  const date = new Date(
    Date.UTC(year, month - 1 + months, Math.min(day, lastDay)) +
      days * 86_400_000,
  );
  return date.toISOString().slice(0, 10);
}

/**
 * Até quando vale a oferta de lançamento: os primeiros meses de pagamento,
 * contando do dia seguinte ao que já está pago (ou ao fim do teste; sem
 * nenhum dos dois, de hoje).
 */
export function launchOfferUntil(
  values: Pick<SubscriptionFormValues, "paidUntil" | "trialEndsAt">,
  todayIso: string,
  months: number,
): string {
  const base = values.paidUntil || values.trialEndsAt;
  const start = base ? shiftIso(base, 1) : todayIso;
  return shiftIso(shiftIso(start, 0, months), -1);
}

/**
 * Prévia do cancelamento (a mesma conta da API, só para o texto da
 * confirmação): a empresa usa até o fim do que pagou ou do teste em andamento
 * e só consulta a partir do dia seguinte; sem nada correndo, a partir de hoje.
 */
export function cancellationPreview(
  subscription: { paidUntil: string | null; trialEndsAt: string | null },
  todayIso: string,
): { lastDay: string | null; from: string } {
  const running = [subscription.paidUntil, subscription.trialEndsAt].filter(
    (date): date is string => date !== null && date >= todayIso,
  );
  if (running.length === 0) return { lastDay: null, from: todayIso };
  const lastDay = running.sort().at(-1)!;
  return { lastDay, from: shiftIso(lastDay, 1) };
}
