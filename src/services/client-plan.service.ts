import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  ClientPlanItem,
  ClientPlanSchedule,
  ClientPlanStatus,
  NewClientPlanInput,
} from "@/types/client-plan";

// A API devolve as datas de calendário como instante à meia-noite UTC e as
// agendas em `recurringAppointments`; a tela usa "aaaa-mm-dd" e `schedules`.
type ClientPlanResponse = Omit<
  ClientPlanItem,
  "startDate" | "endDate" | "firstDueDate" | "schedules"
> & {
  startDate: string;
  endDate: string;
  firstDueDate: string | null;
  recurringAppointments: ClientPlanSchedule[];
};

const toDay = (value: string) => value.slice(0, 10);

function toItem({
  recurringAppointments,
  ...response
}: ClientPlanResponse): ClientPlanItem {
  return {
    ...response,
    startDate: toDay(response.startDate),
    endDate: toDay(response.endDate),
    firstDueDate: response.firstDueDate && toDay(response.firstDueDate),
    schedules: recurringAppointments,
  };
}

type ListClientPlansParams = {
  clientId?: string;
  planId?: string;
  status?: ClientPlanStatus;
  page: number;
  limit: number;
};

/** Contratações, da mais recente para a mais antiga. */
export async function listClientPlans(
  params: ListClientPlansParams,
): Promise<Paginated<ClientPlanItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.clientId) query.set("clientId", params.clientId);
  if (params.planId) query.set("planId", params.planId);
  if (params.status) query.set("status", params.status);

  const result = await apiFetch<Paginated<ClientPlanResponse>>(
    `/client-plans?${query}`,
  );
  return { ...result, items: result.items.map(toItem) };
}

export async function getClientPlan(id: string): Promise<ClientPlanItem> {
  return toItem(await apiFetch<ClientPlanResponse>(`/client-plans/${id}`));
}

/**
 * Contratação, agendas e pagamentos gravados juntos (tudo ou nada). Conflito de
 * horário responde 409 com a data e o horário; dias diferentes da frequência do
 * plano, 400.
 */
export async function createClientPlan(
  input: NewClientPlanInput,
): Promise<ClientPlanItem> {
  return toItem(
    await apiFetch<ClientPlanResponse>("/client-plans", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

/** Encerra as agendas, cancela as sessões futuras e as parcelas a vencer. */
export async function cancelClientPlan(id: string): Promise<void> {
  await apiFetch(`/client-plans/${id}/cancel`, { method: "PATCH" });
}
