"use client";

import { Plus, Trash2 } from "lucide-react";
import { parsePercent, periodPricing } from "@/components/plans/plan-pricing";
import type { PeriodDraft } from "@/components/plans/plan-validation";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/utils/format";
import { onlyDigits } from "@/utils/masks";

type PlanPeriodsFieldProps = {
  value: PeriodDraft[];
  onChange: (periods: PeriodDraft[]) => void;
  /** Erro de cada período, pela chave. */
  errors?: Record<string, string>;
  /** Valor mensal em centavos, para a prévia (vazio = sem prévia). */
  monthlyCents: number;
  /** Gera a chave de uma linha nova. */
  newKey: () => string;
};

const brl = (cents: number) => formatPrice(cents / 100);

// Prévia de uma linha: só quando meses e descontos são válidos.
function preview(period: PeriodDraft, monthlyCents: number): string | null {
  const months = Number(period.months);
  const discount = parsePercent(period.discountPercent);
  const monthly = parsePercent(period.monthlyDiscountPercent);
  if (
    !monthlyCents ||
    !Number.isInteger(months) ||
    months < 1 ||
    !Number.isFinite(discount) ||
    !Number.isFinite(monthly)
  ) {
    return null;
  }
  const price = periodPricing(monthlyCents, months, discount, monthly);
  return `Integral: ${brl(price.integralTotal)} · Mensal: ${months} × ${brl(price.installment)} = ${brl(price.monthlyTotal)}`;
}

/**
 * Períodos de contratação: cada linha com os meses e os dois descontos
 * (integral e mensal), mais a prévia dos valores. A prévia é só informativa: o
 * servidor calcula na contratação.
 */
export function PlanPeriodsField({
  value,
  onChange,
  errors = {},
  monthlyCents,
  newKey,
}: PlanPeriodsFieldProps) {
  function update(key: string, field: keyof PeriodDraft, text: string) {
    onChange(
      value.map((period) =>
        period.key === key ? { ...period, [field]: text } : period,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-control border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Sem períodos, o plano fica salvo, mas só pode ser contratado depois de
          ter ao menos um.
        </p>
      )}

      {value.map((period, index) => {
        const ids = {
          months: `period-${period.key}-months`,
          discount: `period-${period.key}-discount`,
          monthly: `period-${period.key}-monthly`,
        };
        const error = errors[period.key];
        const summary = preview(period, monthlyCents);
        return (
          <div
            key={period.key}
            className="space-y-2 rounded-control border border-border p-3"
          >
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={ids.months}>Meses</Label>
                <Input
                  id={ids.months}
                  inputMode="numeric"
                  value={period.months}
                  aria-invalid={Boolean(error) || undefined}
                  onChange={(event) =>
                    update(
                      period.key,
                      "months",
                      onlyDigits(event.target.value).slice(0, 3),
                    )
                  }
                  placeholder="3"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={ids.discount}>Integral (%)</Label>
                <Input
                  id={ids.discount}
                  inputMode="decimal"
                  value={period.discountPercent}
                  aria-invalid={Boolean(error) || undefined}
                  onChange={(event) =>
                    update(period.key, "discountPercent", event.target.value)
                  }
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={ids.monthly}>Mensal (%)</Label>
                <Input
                  id={ids.monthly}
                  inputMode="decimal"
                  value={period.monthlyDiscountPercent}
                  aria-invalid={Boolean(error) || undefined}
                  onChange={(event) =>
                    update(
                      period.key,
                      "monthlyDiscountPercent",
                      event.target.value,
                    )
                  }
                  placeholder="5"
                />
              </div>
              <Hint label={`Remover o período ${index + 1}`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover o período ${index + 1}`}
                  onClick={() =>
                    onChange(value.filter((item) => item.key !== period.key))
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </Hint>
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : (
              summary && (
                <p className="text-sm text-muted-foreground tabular-nums">
                  {summary}
                </p>
              )
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...value,
            {
              key: newKey(),
              months: "",
              discountPercent: "0",
              monthlyDiscountPercent: "0",
            },
          ])
        }
      >
        <Plus aria-hidden="true" />
        Adicionar período
      </Button>
    </div>
  );
}
