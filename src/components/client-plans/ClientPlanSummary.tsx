import { TriangleAlert } from "lucide-react";
import {
  formatPercent,
  periodPricing,
  toCents,
} from "@/components/plans/plan-pricing";
import type { BillingType } from "@/types/client-plan";
import type { PlanPeriod } from "@/types/plan";
import { formatPrice } from "@/utils/format";

const brl = (cents: number) => formatPrice(cents / 100);

type ClientPlanSummaryProps = {
  monthlyPrice: string;
  period: PlanPeriod;
  /** Sem modalidade, mostra as duas opções. */
  billingType: BillingType | "";
  /**
   * Valor avulso das sessões do período, em centavos, e a quantidade (só
   * quando todas as agendas estão completas).
   */
  standalone?: { cents: number; sessions: number };
};

/**
 * Resumo dos valores da contratação (prévia; o servidor calcula e congela) e o
 * comparativo com o valor avulso das mesmas sessões.
 */
export function ClientPlanSummary({
  monthlyPrice,
  period,
  billingType,
  standalone,
}: ClientPlanSummaryProps) {
  const price = periodPricing(
    toCents(monthlyPrice),
    period.months,
    Number(period.discountPercent),
    Number(period.monthlyDiscountPercent),
  );
  const integral = `${brl(price.integralTotal)} à vista (desconto de ${formatPercent(period.discountPercent)})`;
  const monthly = `${period.months} × ${brl(price.installment)} = ${brl(price.monthlyTotal)} (desconto de ${formatPercent(period.monthlyDiscountPercent)})`;
  const planTotal =
    billingType === "INTEGRAL"
      ? price.integralTotal
      : billingType === "MONTHLY"
        ? price.monthlyTotal
        : null;
  const saving =
    standalone && planTotal !== null ? standalone.cents - planTotal : null;

  return (
    <div className="space-y-2 rounded-control bg-muted px-4 py-3 text-sm tabular-nums">
      <p>
        Valor mensal do plano: <strong>{formatPrice(monthlyPrice)}</strong>
      </p>
      {billingType !== "MONTHLY" && (
        <p>
          <span className="text-muted-foreground">Integral:</span> {integral}
        </p>
      )}
      {billingType !== "INTEGRAL" && (
        <p>
          <span className="text-muted-foreground">Mensal:</span> {monthly}
        </p>
      )}

      {standalone && saving !== null && (
        <div className="border-t border-border pt-2">
          <p>
            {standalone.sessions} sessões no período · Valor avulso:{" "}
            {brl(standalone.cents)} · Valor do plano: {brl(planTotal ?? 0)}
          </p>
          {saving >= 0 ? (
            <p className="font-medium text-success">
              Economia para o cliente: {brl(saving)}
            </p>
          ) : (
            // Só avisa: a empresa decide o preço do plano.
            <p className="flex items-start gap-2 font-medium">
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              O plano sai {brl(-saving)} mais caro que as mesmas sessões
              avulsas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
