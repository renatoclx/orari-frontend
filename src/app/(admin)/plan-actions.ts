"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { parsePercent } from "@/components/plans/plan-pricing";
import {
  hasErrors,
  validatePlanForm,
  type PlanFormValues,
} from "@/components/plans/plan-validation";
import { createPlan, setPlanActive, updatePlan } from "@/services/plan.service";
import type { PlanInput } from "@/types/plan";

export type PlanActionResult =
  { ok: true } | ActionFailure<"name" | "monthlyPrice" | "services">;

// Valida de novo no servidor e monta o corpo da API.
function toInput(values: PlanFormValues): PlanInput {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    // Centavos → reais.
    monthlyPrice: Number(values.monthlyPrice) / 100,
    services: values.services,
    periods: values.periods.map((period) => ({
      months: Number(period.months),
      discountPercent: parsePercent(period.discountPercent),
      monthlyDiscountPercent: parsePercent(period.monthlyDiscountPercent),
    })),
  };
}

async function save(
  values: PlanFormValues,
  operation: (input: PlanInput) => Promise<unknown>,
): Promise<PlanActionResult> {
  if (hasErrors(validatePlanForm(values))) {
    return { ok: false, message: "Corrija os campos destacados." };
  }
  try {
    await operation(toInput(values));
  } catch (error) {
    // O 409 é nome repetido: aparece no campo.
    return failureFrom(error, "name" as const);
  }
  revalidatePath("/pacotes/planos");
  return { ok: true };
}

/** Cadastro: o plano nasce ativo (padrão da API). */
export async function createPlanAction(values: PlanFormValues) {
  return save(values, createPlan);
}

export async function updatePlanAction(id: string, values: PlanFormValues) {
  return save(values, (input) => updatePlan(id, input));
}

export async function setPlanActiveAction(
  id: string,
  isActive: boolean,
): Promise<PlanActionResult> {
  try {
    await setPlanActive(id, isActive);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/pacotes/planos");
  return { ok: true };
}
