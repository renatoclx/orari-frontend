import "server-only";

import { apiFetch } from "@/services/api";
import type { RankingSort, Rankings } from "@/types/rankings";

/** Rankings do período (padrão: mês atual), já ordenados. */
export function getRankings(params: {
  from?: string;
  to?: string;
  sort: RankingSort;
}): Promise<Rankings> {
  const query = new URLSearchParams({ sort: params.sort });
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return apiFetch<Rankings>(`/rankings?${query}`);
}
