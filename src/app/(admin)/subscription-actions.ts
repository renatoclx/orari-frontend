"use server";

import { revalidatePath } from "next/cache";
import {
  ACCESS_GROUPS,
  ACCESS_TEMPLATES,
  applyTemplate,
  entriesFromMatrix,
  toggleGroup,
} from "@/components/companies/company-access";
import { PLANS } from "@/components/subscriptions/subscription-catalog";
import {
  hasErrors,
  toSubscriptionInput,
  validateSubscriptionForm,
  type SubscriptionFormValues,
} from "@/components/subscriptions/subscription-form";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import { saveCompanyAccess } from "@/services/company-access.service";
import { saveSubscription } from "@/services/subscription.service";
import type { SubscriptionPlan } from "@/types/subscription";

// Assinaturas das empresas, só do SUPER_ADMIN (screens/assinaturas.md).

export type SubscriptionActionResult = { ok: true } | ActionFailure;

// A API recusa quem não é SUPER_ADMIN; conferir aqui evita chamá-la.
async function ensureSuperAdmin(): Promise<ActionFailure | null> {
  const { type } = await getCurrentUser();
  return type === "SUPER_ADMIN"
    ? null
    : { ok: false, message: "Só o super administrador gerencia assinaturas." };
}

export async function saveSubscriptionAction(
  companyId: string,
  values: SubscriptionFormValues,
): Promise<SubscriptionActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId)) return { ok: false, message: "Empresa inválida." };
  // A tela já confere; aqui de novo, pois a action pode ser chamada direto.
  if (hasErrors(validateSubscriptionForm(values))) {
    return { ok: false, message: "Confira os campos da assinatura." };
  }

  try {
    await saveSubscription(companyId, toSubscriptionInput(values));
    revalidatePath("/assinaturas");
    return { ok: true };
  } catch (error) {
    return failureFrom(error);
  }
}

/**
 * Aplica à empresa os acessos e limites do plano: o modelo de acesso, os
 * profissionais incluídos mais os extras e, com o adicional, as três linhas
 * de Anamnese. Substitui a matriz atual (como "Aplicar modelo" em Empresas).
 */
export async function applyPlanAccessAction(
  companyId: string,
  plan: SubscriptionPlan,
  extraProfessionals: number,
  anamnesisAddon: boolean,
): Promise<SubscriptionActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId)) return { ok: false, message: "Empresa inválida." };

  const templateKey = PLANS.find((item) => item.key === plan)?.template;
  const template = ACCESS_TEMPLATES.find((item) => item.key === templateKey);
  if (!template) return { ok: false, message: "Plano sem modelo de acesso." };

  const { matrix, limits } = applyTemplate(template);
  const anamnesis = ACCESS_GROUPS.find((group) => group.label === "Anamnese");
  const finalMatrix =
    anamnesisAddon && anamnesis
      ? toggleGroup(matrix, anamnesis.features, true)
      : matrix;

  try {
    await saveCompanyAccess(companyId, {
      features: entriesFromMatrix(finalMatrix),
      limits: {
        professionals: limits.professionals + Math.max(0, extraProfessionals),
        admins: limits.admins,
      },
    });
    return { ok: true };
  } catch (error) {
    return failureFrom(error);
  }
}
