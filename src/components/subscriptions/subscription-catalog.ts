import type {
  BillingCycle,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

// Tabela de preços do Orari (docs/decisions.md, "Planos"). Duplicada da landing
// por decisão (2026-11-17): mudou lá, muda aqui. Serve só para o valor sugerido;
// o valor gravado na assinatura é o que vale.

export const PLANS: {
  key: SubscriptionPlan;
  label: string;
  /** Chave do modelo de acesso (`ACCESS_TEMPLATES`) com a mesma matriz. */
  template: string;
  monthly: number;
}[] = [
  {
    key: "ESSENTIAL",
    label: "Essencial",
    template: "essential",
    monthly: 44.9,
  },
  { key: "PLUS", label: "Plus", template: "plus", monthly: 89.9 },
  { key: "CLINICAL", label: "Clinical", template: "clinical", monthly: 129.9 },
];

export const CYCLES: {
  key: BillingCycle;
  label: string;
  months: number;
  /** Desconto sobre o mensal (0,15 = 15%). */
  discount: number;
}[] = [
  { key: "MONTHLY", label: "Mensal", months: 1, discount: 0 },
  { key: "SEMIANNUAL", label: "Semestral", months: 6, discount: 0.15 },
  { key: "ANNUAL", label: "Anual", months: 12, discount: 0.3 },
];

/** Profissional além dos incluídos no plano, por mês. */
export const EXTRA_PROFESSIONAL_MONTHLY = 16.9;
/** Oferta de lançamento: o desconto e por quantos meses de pagamento ele vale. */
export const LAUNCH_OFFER = { percent: 50, months: 3 };

/** Adicional de anamnese (Essencial e Plus), por mês. */
export const ANAMNESIS_ADDON_MONTHLY = 24.9;

export const planLabel = (plan: SubscriptionPlan) =>
  PLANS.find((item) => item.key === plan)?.label ?? plan;

export const cycleLabel = (cycle: BillingCycle) =>
  CYCLES.find((item) => item.key === cycle)?.label ?? cycle;

// Arredonda para o final ,90 mais próximo (ex.: 76,32 → 75,90; 76,50 → 76,90).
function toNinety(value: number): number {
  return Math.round(value - 0.9) + 0.9;
}

/**
 * Valor sugerido do ciclo: mensal do plano + extras + anamnese; nos ciclos
 * longos, a parcela mensal com desconto arredondada para ,90 (como na
 * landing), vezes os meses. Em reais, com duas casas.
 */
export function suggestedPrice(input: {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  extraProfessionals: number;
  anamnesisAddon: boolean;
}): number {
  const plan = PLANS.find((item) => item.key === input.plan);
  const cycle = CYCLES.find((item) => item.key === input.cycle);
  if (!plan || !cycle) return 0;
  const monthly =
    plan.monthly +
    input.extraProfessionals * EXTRA_PROFESSIONAL_MONTHLY +
    // O adicional de anamnese não existe no Clinical (já vem incluída).
    (input.anamnesisAddon && input.plan !== "CLINICAL"
      ? ANAMNESIS_ADDON_MONTHLY
      : 0);
  const installment =
    cycle.discount > 0 ? toNinety(monthly * (1 - cycle.discount)) : monthly;
  return Math.round(installment * cycle.months * 100) / 100;
}

/** Texto e cor da badge de cada situação (decididos em 2026-11-17). */
export const STATUS_BADGES: Record<
  SubscriptionStatus,
  { label: string; variant: "success" | "destructive" | "secondary" }
> = {
  TRIAL: { label: "Em teste", variant: "secondary" },
  ACTIVE: { label: "Ativa", variant: "success" },
  OVERDUE: { label: "Em atraso", variant: "secondary" },
  READ_ONLY: { label: "Só consulta", variant: "destructive" },
  CANCELED: { label: "Cancelada", variant: "destructive" },
};
