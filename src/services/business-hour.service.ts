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

/** Todas as janelas da empresa (a semana inteira). */
export async function listAllBusinessHours(): Promise<BusinessHour[]> {
  const { items } = await apiFetch<Paginated<BusinessHour>>(
    "/business-hours?limit=100",
  );
  return items;
}

export type BusinessHourInput = Omit<BusinessHour, "id">;

/** Cria várias janelas de uma vez (uma transação na API). */
export async function createBusinessHours(
  inputs: BusinessHourInput[],
): Promise<void> {
  await apiFetch("/business-hours/batch", {
    method: "POST",
    body: JSON.stringify(inputs),
  });
}

export async function updateBusinessHour(
  id: string,
  input: BusinessHourInput,
): Promise<void> {
  await apiFetch(`/business-hours/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Exclusão lógica da janela. */
export async function deleteBusinessHour(id: string): Promise<void> {
  await apiFetch(`/business-hours/${id}`, { method: "DELETE" });
}
