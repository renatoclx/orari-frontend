import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { BirthdayClient, ClientsReport } from "@/types/clients-report";

type Period = {
  /** "aaaa-mm-dd"; sem as duas, o mês atual. */
  from?: string;
  to?: string;
};

function periodQuery({ from, to }: Period) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  return query;
}

/** Perfil dos clientes da empresa. */
export function getClientsReport(period: Period): Promise<ClientsReport> {
  const query = periodQuery(period).toString();
  return apiFetch<ClientsReport>(`/clients-report${query ? `?${query}` : ""}`);
}

/** Aniversariantes do período, pela data do aniversário. */
export function listBirthdays(
  params: Period & { page: number; limit: number },
): Promise<Paginated<BirthdayClient>> {
  const query = periodQuery(params);
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  return apiFetch<Paginated<BirthdayClient>>(
    `/clients-report/birthdays?${query}`,
  );
}
