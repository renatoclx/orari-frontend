import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  PortfolioClient,
  PortfolioParams,
  PortfolioStatus,
  PortfolioSummary,
} from "@/types/client-portfolio";

function periodQuery({ professionalId, from, to }: PortfolioParams) {
  const query = new URLSearchParams({ professionalId });
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  return query;
}

/** Os números dos cartões da carteira do profissional no período. */
export function getPortfolioSummary(
  params: PortfolioParams,
): Promise<PortfolioSummary> {
  return apiFetch<PortfolioSummary>(`/client-portfolio?${periodQuery(params)}`);
}

/** Os clientes da carteira (quem precisa de contato primeiro), paginados. */
export function listPortfolioClients(
  params: PortfolioParams & {
    status?: PortfolioStatus;
    search?: string;
    page: number;
    limit: number;
  },
): Promise<Paginated<PortfolioClient>> {
  const query = periodQuery(params);
  if (params.status) query.set("status", params.status);
  const search = params.search?.trim();
  if (search) query.set("search", search);
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  return apiFetch<Paginated<PortfolioClient>>(
    `/client-portfolio/clients?${query}`,
  );
}
