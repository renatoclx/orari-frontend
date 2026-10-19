// Espelha a resposta de /plans do backend.

/** Período de contratação do plano; os percentuais chegam como texto (Decimal). */
export type PlanPeriod = {
  months: number;
  /** Desconto sobre o total do período no pagamento integral. */
  discountPercent: string;
  /** Desconto sobre cada parcela no pagamento mensal. */
  monthlyDiscountPercent: string;
};

export type PlanItem = {
  id: string;
  name: string;
  description: string | null;
  /** Valor mensal do plano, em reais (Decimal como texto, ex.: "400"). */
  monthlyPrice: string;
  isActive: boolean;
  periods: PlanPeriod[];
  /** Serviços do plano; `isActive` indica serviço inativado depois. */
  services: {
    id: string;
    name: string;
    isActive: boolean;
    /** Atendimentos por semana (1 a 7): a contratação marca essa quantidade de dias. */
    sessionsPerWeek: number;
  }[];
};

/** Corpo de POST e PATCH /plans (as listas substituem as anteriores). */
export type PlanInput = {
  name: string;
  /** `null` remove a descrição (PATCH). */
  description: string | null;
  monthlyPrice: number;
  services: { serviceId: string; sessionsPerWeek: number }[];
  periods: {
    months: number;
    discountPercent: number;
    monthlyDiscountPercent: number;
  }[];
};
