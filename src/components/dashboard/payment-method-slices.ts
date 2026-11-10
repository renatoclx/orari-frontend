// Fatias da rosca de métodos de pagamento (Dashboard), em função pura.
import type { FinancialReportMethod } from "@/types/financial-report";

/** Quantos métodos têm cor própria; o resto vira "Outros". */
export const COLORED_METHODS = 5;

export type MethodSlice = {
  key: string;
  label: string;
  amount: number;
  count: number;
  share: number;
  /** Variável CSS da cor (categórica ou cinza para "Outros"). */
  color: string;
};

/**
 * A cor segue o método, não a posição no período: é a ordem do cadastro de
 * métodos da empresa (alfabética). Os 5 primeiros do cadastro têm cor
 * própria; os demais e os pagamentos sem método somam em "Outros", no fim.
 */
export function methodSlices(
  methods: FinancialReportMethod[],
  /** Ids dos métodos da empresa, na ordem do cadastro. */
  order: string[],
): MethodSlice[] {
  const slices: MethodSlice[] = [];
  const others = { amount: 0, count: 0, share: 0 };

  for (const method of methods) {
    const index = method.id === null ? -1 : order.indexOf(method.id);
    if (index < 0 || index >= COLORED_METHODS) {
      others.amount += Number(method.amount);
      others.count += method.count;
      others.share += method.share;
      continue;
    }
    slices.push({
      key: method.id!,
      label: method.name ?? "",
      amount: Number(method.amount),
      count: method.count,
      share: method.share,
      color: `var(--chart-cat-${index + 1})`,
    });
  }

  if (others.count > 0) {
    slices.push({
      key: "outros",
      label: "Outros",
      ...others,
      color: "var(--muted-foreground)",
    });
  }
  return slices;
}
