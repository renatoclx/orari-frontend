import "server-only";

import { apiFetch } from "@/services/api";
import type { Company } from "@/types/company";

/** Dados cadastrais da empresa (o ADMIN só lê a própria). */
export function getCompany(id: string): Promise<Company> {
  return apiFetch<Company>(`/companies/${id}`);
}
