// Prévia dos valores de um período do plano, com as mesmas regras do backend
// (business-rules.md, "Descontos por período"): duas casas, metade para cima; no
// mensal, a parcela é arredondada antes do total. Só informativa: quem calcula
// de verdade é o servidor, na contratação.

// Conta em inteiros (centavos e centésimos de ponto percentual), sem erro de
// ponto flutuante. BigInt: valor × meses × 10.000 pode passar do inteiro seguro.
const WHOLE = BigInt(10000);
const HALF = BigInt(5000);

function applyDiscount(cents: bigint, percent: number): bigint {
  const basisPoints = BigInt(Math.round(percent * 100));
  // Metade para cima: soma meio antes de dividir.
  return (cents * (WHOLE - basisPoints) + HALF) / WHOLE;
}

export type PeriodPricing = {
  /** Total do período no pagamento integral, em centavos. */
  integralTotal: number;
  /** Parcela e total no pagamento mensal, em centavos. */
  installment: number;
  monthlyTotal: number;
};

export function periodPricing(
  monthlyCents: number,
  months: number,
  discountPercent: number,
  monthlyDiscountPercent: number,
): PeriodPricing {
  const monthly = BigInt(Math.round(monthlyCents));
  const installment = applyDiscount(monthly, monthlyDiscountPercent);
  return {
    integralTotal: Number(
      applyDiscount(monthly * BigInt(months), discountPercent),
    ),
    installment: Number(installment),
    monthlyTotal: Number(installment * BigInt(months)),
  };
}

/** Semanas consideradas em um mês para o valor sugerido (combinado com a empresa). */
export const WEEKS_PER_MONTH = 4;

/**
 * Valor mensal sugerido, em centavos: preço avulso × atendimentos por semana ×
 * 4 semanas, somado. Serviço sem preço conta como zero.
 */
export function suggestedMonthlyCents(
  items: { priceCents: number | null; sessionsPerWeek: number }[],
): number {
  return items.reduce(
    (sum, item) =>
      sum + (item.priceCents ?? 0) * item.sessionsPerWeek * WEEKS_PER_MONTH,
    0,
  );
}

/** "400" ou "400.5" (reais, texto da API) → centavos. */
export function toCents(reais: string): number {
  return Math.round(Number(reais) * 100);
}

/** "12,5" ou "12.5" → 12.5; vazio ou inválido → NaN. */
export function parsePercent(text: string): number {
  const normalized = text.trim().replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}

/** 12.5 → "12,5%"; "10" (texto da API) → "10%". */
export function formatPercent(value: number | string): string {
  return `${String(Number(value)).replace(".", ",")}%`;
}

/** "3, 6 e 12 meses" (ou "1 mês"). */
export function describeMonths(months: number[]): string {
  if (months.length === 0) return "";
  const sorted = [...months].sort((a, b) => a - b);
  const list =
    sorted.length === 1
      ? String(sorted[0])
      : `${sorted.slice(0, -1).join(", ")} e ${sorted.at(-1)}`;
  return `${list} ${sorted.length === 1 && sorted[0] === 1 ? "mês" : "meses"}`;
}
