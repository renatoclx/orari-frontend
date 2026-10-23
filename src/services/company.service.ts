import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@/types/company";

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

type ListCompaniesParams = {
  /** Só o SUPER_ADMIN filtra por status; sem ele, ativas e inativas. */
  isActive?: boolean;
  page: number;
  limit: number;
};

/** Empresas da plataforma, da mais recente para a mais antiga (só o SUPER_ADMIN vê todas). */
export function listCompanies(
  params: ListCompaniesParams,
): Promise<Paginated<Company>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  return apiFetch<Paginated<Company>>(`/companies?${query}`);
}

/** Cadastro de empresa (SUPER_ADMIN); documento ou subdomínio repetido responde 409. */
export function createCompany(input: CreateCompanyInput): Promise<Company> {
  return apiFetch<Company>("/companies", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Alteração dos dados cadastrais e do status (SUPER_ADMIN). */
export async function updateCompany(
  id: string,
  input: UpdateCompanyInput,
): Promise<void> {
  await apiFetch(`/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
