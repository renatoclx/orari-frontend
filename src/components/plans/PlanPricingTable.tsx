import {
  formatPercent,
  periodPricing,
  toCents,
} from "@/components/plans/plan-pricing";
import type { PlanPeriod } from "@/types/plan";
import { formatPrice } from "@/utils/format";

const brl = (cents: number) => formatPrice(cents / 100);

/** Períodos do plano com os descontos e a prévia dos valores (visualizar). */
export function PlanPricingTable({
  monthlyPrice,
  periods,
}: {
  monthlyPrice: string;
  periods: PlanPeriod[];
}) {
  const monthly = toCents(monthlyPrice);
  const headerClass = "px-3 py-2 font-medium text-muted-foreground";

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-border">
        <tr>
          <th scope="col" className={headerClass}>
            Período
          </th>
          <th scope="col" className={headerClass}>
            Integral
          </th>
          <th scope="col" className={headerClass}>
            Mensal
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {periods.map((period) => {
          const price = periodPricing(
            monthly,
            period.months,
            Number(period.discountPercent),
            Number(period.monthlyDiscountPercent),
          );
          return (
            <tr key={period.months} className="tabular-nums">
              <td className="px-3 py-2 whitespace-nowrap">
                {period.months} {period.months === 1 ? "mês" : "meses"}
              </td>
              <td className="px-3 py-2">
                {brl(price.integralTotal)}
                <span className="block text-xs text-muted-foreground">
                  desconto de {formatPercent(period.discountPercent)}
                </span>
              </td>
              <td className="px-3 py-2">
                {period.months} × {brl(price.installment)} ={" "}
                {brl(price.monthlyTotal)}
                <span className="block text-xs text-muted-foreground">
                  desconto de {formatPercent(period.monthlyDiscountPercent)}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
