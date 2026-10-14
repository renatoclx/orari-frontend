import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { BusinessHour, WeekDay } from "@/types/business-hour";

/** Janelas de atendimento da empresa em um dia da semana, em ordem de horário. */
export async function listBusinessHours(
  weekDay: WeekDay,
): Promise<BusinessHour[]> {
  const query = new URLSearchParams({ weekDay, limit: "100" });
  const { items } = await apiFetch<Paginated<BusinessHour>>(
    `/business-hours?${query}`,
  );
  return items;
}
