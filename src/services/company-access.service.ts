import "server-only";

import { apiFetch } from "@/services/api";
import type {
  CompanyAccessResponse,
  FeatureAccessEntry,
  CompanyLimits,
} from "@/types/company-access";

// Acessos e limites por empresa (só o SUPER_ADMIN): ver screens/empresas.md.

export function getCompanyAccess(
  companyId: string,
): Promise<CompanyAccessResponse> {
  return apiFetch<CompanyAccessResponse>(`/companies/${companyId}/access`);
}

/** Substitui a matriz e os limites da empresa de uma vez. */
export async function saveCompanyAccess(
  companyId: string,
  body: { features: FeatureAccessEntry[]; limits: CompanyLimits },
): Promise<void> {
  await apiFetch(`/companies/${companyId}/access`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
