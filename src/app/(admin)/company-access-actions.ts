"use server";

import {
  entriesFromMatrix,
  matrixFromEntries,
  parseLimit,
} from "@/components/companies/company-access";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import { getCurrentUser } from "@/services/auth.service";
import {
  getCompanyAccess,
  saveCompanyAccess,
} from "@/services/company-access.service";
import type {
  AccessMatrix,
  CompanyAccess,
  CompanyUsage,
} from "@/types/company-access";

// Acessos e limites por empresa, só do SUPER_ADMIN (screens/empresas.md).

export type CompanyAccessResult =
  { ok: true; access: CompanyAccess; usage: CompanyUsage } | ActionFailure;

export type SaveCompanyAccessResult = { ok: true } | ActionFailure;

// A API recusa quem não é SUPER_ADMIN; conferir aqui evita chamá-la.
async function ensureSuperAdmin(): Promise<ActionFailure | null> {
  const { type } = await getCurrentUser();
  return type === "SUPER_ADMIN"
    ? null
    : { ok: false, message: "Só o super administrador gerencia acessos." };
}

export async function getCompanyAccessAction(
  companyId: string,
): Promise<CompanyAccessResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId)) return { ok: false, message: "Empresa inválida." };

  try {
    const { features, limits, usage } = await getCompanyAccess(companyId);
    return {
      ok: true,
      access: { matrix: matrixFromEntries(features), limits },
      usage,
    };
  } catch (error) {
    return failureFrom(error);
  }
}

/** A API valida a matriz (dependências entre funcionalidades): a recusa volta como mensagem. */
export async function saveCompanyAccessAction(
  companyId: string,
  matrix: AccessMatrix,
  limits: { professionals: string; admins: string },
): Promise<SaveCompanyAccessResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  if (!isUuid(companyId)) return { ok: false, message: "Empresa inválida." };

  const professionals = parseLimit(limits.professionals);
  const admins = parseLimit(limits.admins);
  if (professionals === undefined || admins === undefined) {
    return { ok: false, message: "Informe limites válidos." };
  }

  try {
    await saveCompanyAccess(companyId, {
      features: entriesFromMatrix(matrix),
      limits: { professionals, admins },
    });
    return { ok: true };
  } catch (error) {
    return failureFrom(error);
  }
}
