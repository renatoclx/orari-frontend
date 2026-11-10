import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { EndingContract, PackagesReport } from "@/types/packages-report";

/** Resumo das contratações (período padrão: mês atual). */
export function getPackagesReport(params: {
  from?: string;
  to?: string;
}): Promise<PackagesReport> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  const text = query.toString();
  return apiFetch<PackagesReport>(`/packages-report${text ? `?${text}` : ""}`);
}

/** Contratações terminando em breve, do fim mais próximo. */
export function listEndingContracts(params: {
  page: number;
  limit: number;
}): Promise<Paginated<EndingContract>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  return apiFetch<Paginated<EndingContract>>(
    `/packages-report/ending?${query}`,
  );
}
