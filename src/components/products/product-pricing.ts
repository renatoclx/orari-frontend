// Margem de lucro do produto (backend: product-pricing.ts). A API calcula e
// grava; aqui serve à prévia do formulário e à formatação da lista.

/**
 * Margem sobre o preço de venda, `(venda − custo) ÷ venda × 100`, com duas
 * casas. Sem venda maior que zero, não há margem (`null`).
 */
export function profitMargin(sale: number, cost: number): number | null {
  if (!(sale > 0) || !(cost > 0)) return null;
  return Math.round(((sale - cost) / sale) * 100 * 100) / 100;
}

/** 40 → "40%"; 37.5 → "37,5%"; -20 → "-20%" (a API manda texto: "37.5"). */
export function formatMargin(margin: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(Number(margin) / 100);
}

/** Custo acima da venda: a tela destaca em vermelho. */
export const isNegativeMargin = (margin: number | string | null) =>
  margin !== null && Number(margin) < 0;
