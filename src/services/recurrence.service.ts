import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { AppointmentItem } from "@/types/appointment";
import type {
  NewRecurrenceInput,
  RecurrenceItem,
  RecurrenceSession,
} from "@/types/recurrence";

// A API devolve as datas de calendário como instante ("2026-10-08T00:00:00.000Z");
// a tela trabalha com "aaaa-mm-dd".
type RecurrenceResponse = Omit<RecurrenceItem, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

const toDay = (value: string) => value.slice(0, 10);

function toItem(response: RecurrenceResponse): RecurrenceItem {
  return {
    ...response,
    startDate: toDay(response.startDate),
    endDate: toDay(response.endDate),
  };
}

type ListRecurrencesParams = {
  professionalId?: string;
  clientId?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

/** Recorrências ativas e canceladas (o status vem de `isActive`), por data inicial. */
export async function listRecurrences(
  params: ListRecurrencesParams,
): Promise<Paginated<RecurrenceItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.professionalId) query.set("professionalId", params.professionalId);
  if (params.clientId) query.set("clientId", params.clientId);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }

  const result = await apiFetch<Paginated<RecurrenceResponse>>(
    `/recurring-appointments?${query}`,
  );
  return { ...result, items: result.items.map(toItem) };
}

export async function getRecurrence(id: string): Promise<RecurrenceItem> {
  return toItem(
    await apiFetch<RecurrenceResponse>(`/recurring-appointments/${id}`),
  );
}

// Máximo que a API aceita por página.
const PAGE_SIZE = 100;

/**
 * Sessões (agendamentos) geradas pela recorrência, em ordem cronológica.
 * Percorre as páginas: uma recorrência de 12 meses passa de 100 sessões.
 */
export async function listRecurrenceSessions(
  id: string,
): Promise<RecurrenceSession[]> {
  const items: AppointmentItem[] = [];

  for (let page = 1; ; page++) {
    const query = new URLSearchParams({
      recurringAppointmentId: id,
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const result = await apiFetch<Paginated<AppointmentItem>>(
      `/appointments?${query}`,
    );
    items.push(...result.items);
    if (items.length >= result.total || result.items.length === 0) break;
  }

  return items
    .map(({ id, startAt, endAt, status }) => ({ id, startAt, endAt, status }))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

/**
 * Cria a recorrência e gera as sessões (tudo ou nada). Conflito responde 409
 * com a data e o horário que causaram o problema.
 */
export async function createRecurrence(
  input: NewRecurrenceInput,
): Promise<RecurrenceItem> {
  return toItem(
    await apiFetch<RecurrenceResponse>("/recurring-appointments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

/**
 * Cancela a recorrência: as sessões futuras que não começaram são canceladas.
 * A de um pacote só é encerrada pelo cancelamento da contratação (400).
 */
export async function cancelRecurrence(id: string): Promise<void> {
  await apiFetch(`/recurring-appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: false }),
  });
}

/** `null` remove a observação. */
export async function updateRecurrenceNote(
  id: string,
  note: string | null,
): Promise<void> {
  await apiFetch(`/recurring-appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

export async function cancelRecurrenceSession(
  id: string,
  sessionId: string,
): Promise<void> {
  await apiFetch(
    `/recurring-appointments/${id}/appointments/${sessionId}/cancel`,
    { method: "PATCH" },
  );
}

/** Remanejamento: só o início muda; o fim vem da duração do serviço. */
export async function rescheduleRecurrenceSession(
  id: string,
  sessionId: string,
  startAt: string,
): Promise<void> {
  await apiFetch(
    `/recurring-appointments/${id}/appointments/${sessionId}/reschedule`,
    { method: "PATCH", body: JSON.stringify({ startAt }) },
  );
}
