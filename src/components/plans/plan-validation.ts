import { parsePercent } from "@/components/plans/plan-pricing";

/** Período como o formulário o edita (textos), com a chave da linha. */
export type PeriodDraft = {
  key: string;
  months: string;
  discountPercent: string;
  monthlyDiscountPercent: string;
};

/** Serviço do plano e quantos atendimentos por semana ele tem. */
export type PlanServiceDraft = { serviceId: string; sessionsPerWeek: number };

/** Atendimentos por semana: de 1 a 7. */
export const MAX_SESSIONS_PER_WEEK = 7;

/** Valores do formulário de plano. */
export type PlanFormValues = {
  name: string;
  description: string;
  /** Centavos, só dígitos (máscara BRL). */
  monthlyPrice: string;
  services: PlanServiceDraft[];
  periods: PeriodDraft[];
};

export type PlanFormErrors = {
  name?: string;
  monthlyPrice?: string;
  services?: string;
  /** Erro de cada período, pela chave da linha. */
  periods?: Record<string, string>;
};

// Decimal(10,2) do banco: até 99.999.999,99.
const MAX_PRICE_CENTS = 9_999_999_999;

// Percentual de 0 a 100, com até duas casas decimais.
function validPercent(text: string): boolean {
  const value = parsePercent(text);
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100 &&
    /^\d+([.,]\d{1,2})?$/.test(text.trim())
  );
}

/**
 * Regras do backend (business-rules.md, "Planos"): nome e valor mensal
 * obrigatórios, ao menos um serviço (ativo), meses inteiros a partir de 1 sem
 * repetir e os dois percentuais de 0 a 100. `inactiveIds`: serviços do plano que
 * foram inativados (precisam sair para salvar).
 */
export function validatePlanForm(
  values: PlanFormValues,
  inactiveIds: string[] = [],
): PlanFormErrors {
  const errors: PlanFormErrors = {};

  if (!values.name.trim()) errors.name = "Informe o nome do plano.";
  if (!values.monthlyPrice) {
    errors.monthlyPrice = "Informe o valor mensal.";
  } else if (Number(values.monthlyPrice) > MAX_PRICE_CENTS) {
    errors.monthlyPrice = "Informe um valor menor.";
  }

  if (values.services.length === 0) {
    errors.services = "Escolha ao menos um serviço.";
  } else if (
    values.services.some((item) => inactiveIds.includes(item.serviceId))
  ) {
    errors.services = "Remova os serviços inativos para salvar.";
  } else if (
    values.services.some(
      (item) =>
        !Number.isInteger(item.sessionsPerWeek) ||
        item.sessionsPerWeek < 1 ||
        item.sessionsPerWeek > MAX_SESSIONS_PER_WEEK,
    )
  ) {
    errors.services = "Os atendimentos por semana vão de 1 a 7.";
  }

  const periodErrors: Record<string, string> = {};
  const seen = new Set<number>();
  for (const period of values.periods) {
    const months = Number(period.months);
    if (!period.months || !Number.isInteger(months) || months < 1) {
      periodErrors[period.key] = "Informe os meses (a partir de 1).";
    } else if (seen.has(months)) {
      periodErrors[period.key] = `O período de ${months} meses já existe.`;
    } else if (
      !validPercent(period.discountPercent) ||
      !validPercent(period.monthlyDiscountPercent)
    ) {
      periodErrors[period.key] =
        "Os descontos vão de 0 a 100, com até duas casas decimais.";
    }
    if (Number.isInteger(months)) seen.add(months);
  }
  if (Object.keys(periodErrors).length > 0) errors.periods = periodErrors;

  return errors;
}

export function hasErrors(errors: PlanFormErrors): boolean {
  return Boolean(
    errors.name || errors.monthlyPrice || errors.services || errors.periods,
  );
}
