import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { AppointmentItem, AppointmentStatus } from "@/types/appointment";

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
  /** Só os agendamentos deste profissional. */
  professionalId?: string;
  /** Só os agendamentos deste cliente. */
  clientId?: string;
}): Promise<AppointmentItem[]> {
  const items: AppointmentItem[] = [];

  for (let page = 1; ; page++) {
    const query = new URLSearchParams({
      from: period.from.toISOString(),
      to: period.to.toISOString(),
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (period.professionalId) {
      query.set("professionalId", period.professionalId);
    }
    if (period.clientId) query.set("clientId", period.clientId);
    const result = await apiFetch<Paginated<AppointmentItem>>(
      `/appointments?${query}`,
    );

    items.push(...result.items);
    if (items.length >= result.total || result.items.length === 0) break;
  }

  return items;
}

/**
 * Uma página de agendamentos de um cliente (histórico): a partir de `from` ou
 * antes de `to`, na ordem pedida (`desc` = o mais recente primeiro).
 */
export function listClientAppointments(params: {
  clientId: string;
  from?: Date;
  to?: Date;
  status?: AppointmentStatus;
  order: "asc" | "desc";
  page: number;
  limit: number;
}): Promise<Paginated<AppointmentItem>> {
  const query = new URLSearchParams({
    clientId: params.clientId,
    order: params.order,
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.from) query.set("from", params.from.toISOString());
  if (params.to) query.set("to", params.to.toISOString());
  if (params.status) query.set("status", params.status);
  return apiFetch<Paginated<AppointmentItem>>(`/appointments?${query}`);
}

/** Dados de um agendamento comum (o fim é calculado pela API: início + duração). */
export type NewAppointmentInput = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  /** Início em UTC (ISO 8601). */
  startAt: string;
  note?: string;
  /** Autoriza o encaixe: agendar fora do horário de funcionamento. */
  overBooking?: boolean;
};

/**
 * Cria um agendamento comum, dentro de uma janela de atendimento. Conflito de
 * horário do cliente ou do profissional responde 409.
 */
export function createAppointment(
  input: NewAppointmentInput,
): Promise<AppointmentItem> {
  return apiFetch<AppointmentItem>("/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Cancela o agendamento (não há exclusão: o ciclo de vida é o status). O horário
 * fica livre. Agendamento gerado por recorrência é cancelado pela recorrência.
 */
export function cancelAppointment(id: string): Promise<AppointmentItem> {
  return apiFetch<AppointmentItem>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "CANCELLED" }),
  });
}

/** Campos que a alteração pode mudar; só o que for informado é enviado. */
export type UpdateAppointmentInput = {
  clientId?: string;
  professionalId?: string;
  serviceId?: string;
  /** Novo início em UTC (ISO 8601). */
  startAt?: string;
  /** `null` remove a observação. */
  note?: string | null;
  /**
   * Reautoriza o encaixe: ao mudar horário ou serviço, a API reavalia o
   * agendamento e exige a autorização de novo se ele ficar fora do expediente.
   */
  overBooking?: boolean;
};

/** Altera o agendamento (remarcar, trocar serviço, cliente, profissional ou observação). */
export function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
): Promise<AppointmentItem> {
  return apiFetch<AppointmentItem>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
