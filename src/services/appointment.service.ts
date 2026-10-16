import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { AppointmentItem } from "@/types/appointment";

// Máximo que a API aceita por página.
const PAGE_SIZE = 100;

/**
 * Agendamentos que começam no período (`from` <= início < `to`), em ordem
 * cronológica, de todos os profissionais. Percorre as páginas, para a agenda
 * de um dia nunca ficar incompleta.
 */
export async function listAppointments(period: {
  from: Date;
  to: Date;
}): Promise<AppointmentItem[]> {
  const items: AppointmentItem[] = [];

  for (let page = 1; ; page++) {
    const query = new URLSearchParams({
      from: period.from.toISOString(),
      to: period.to.toISOString(),
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const result = await apiFetch<Paginated<AppointmentItem>>(
      `/appointments?${query}`,
    );

    items.push(...result.items);
    if (items.length >= result.total || result.items.length === 0) break;
  }

  return items;
}
