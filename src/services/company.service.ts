import "server-only";

import { apiFetch } from "@/services/api";
import type { Company } from "@/types/company";

/** Dados cadastrais da empresa (o ADMIN só lê a própria). */
export function getCompany(id: string): Promise<Company> {
  return apiFetch<Company>(`/companies/${id}`);
}

/** Nome fantasia da empresa do usuário logado; `null` remove (volta a razão social). */
export async function updateCompanyName(
  fantasyName: string | null,
): Promise<void> {
  await apiFetch("/companies/me", {
    method: "PATCH",
    body: JSON.stringify({ fantasyName }),
  });
}

/** Envia a logo (JPEG ou PNG, até 2 MB); a anterior é apagada pela API. */
export async function uploadCompanyLogo(logo: File): Promise<void> {
  const body = new FormData();
  body.append("logo", logo, logo.name);
  await apiFetch("/companies/me/logo", { method: "POST", body });
}

export async function removeCompanyLogo(): Promise<void> {
  await apiFetch("/companies/me/logo", { method: "DELETE" });
}
