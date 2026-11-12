import "server-only";

import { cache } from "react";
import { proFetch } from "@/services/app-pro-api";
import type { CurrentUser } from "@/types/auth";
import type {
  ProfessionalAgenda,
  ProfessionalClientDetail,
  ProfessionalClientsPage,
  ProfessionalHome,
  ProfessionalClosingsPage,
  ProfessionalClosingReceipt,
  ProfessionalCommissionsPage,
  ProfessionalCommissionSummary,
} from "@/types/professional-app";

// Rotas da API usadas pelo app do profissional (screens/app-profissional.md).

/**
 * Quem entrou: o usuário e a empresa. O `cache` evita repetir a chamada quando
 * o layout e a página precisam do usuário na mesma requisição.
 */
export const getProfessionalMe = cache(() => proFetch<CurrentUser>("/auth/me"));

/** Troca a própria senha; a API encerra as sessões (a tela entra de novo). */
export function changeProfessionalPassword(input: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<void> {
  return proFetch<void>("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Agenda do dia (AAAA-MM-DD, no relógio da clínica); sem o dia, hoje. */
export function getProfessionalAgenda(
  day?: string,
): Promise<ProfessionalAgenda> {
  const query = day ? `?day=${encodeURIComponent(day)}` : "";
  return proFetch<ProfessionalAgenda>(`/professional-app/agenda${query}`);
}

/** Clientes dele, em ordem alfabética (20 por página); `search` filtra pelo nome. */
export function listProfessionalClients(
  page: number,
  search?: string,
): Promise<ProfessionalClientsPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  return proFetch<ProfessionalClientsPage>(
    `/professional-app/clients?${params}`,
  );
}

/** A ficha de um cliente dele; cliente de outro profissional dá 404 (`ApiError`). */
export function getProfessionalClient(
  id: string,
): Promise<ProfessionalClientDetail> {
  return proFetch<ProfessionalClientDetail>(
    `/professional-app/clients/${encodeURIComponent(id)}`,
  );
}

/** Resumo do mês (AAAA-MM; sem ele, o atual) das comissões dele. */
export function getProfessionalCommissionSummary(
  month?: string,
): Promise<ProfessionalCommissionSummary> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return proFetch<ProfessionalCommissionSummary>(
    `/professional-app/commissions/summary${query}`,
  );
}

/** As comissões do mês, atendimento a atendimento (20 por página). */
export function listProfessionalCommissions(
  month: string,
  page: number,
): Promise<ProfessionalCommissionsPage> {
  const params = new URLSearchParams({ month, page: String(page) });
  return proFetch<ProfessionalCommissionsPage>(
    `/professional-app/commissions?${params}`,
  );
}

/** Os fechamentos dele, do número maior para o menor, 10 por página (os desfeitos, marcados). */
export function listProfessionalClosings(
  page: number,
): Promise<ProfessionalClosingsPage> {
  return proFetch<ProfessionalClosingsPage>(
    `/professional-app/commission-closings?page=${page}`,
  );
}

/** O recibo de um fechamento dele; de outro profissional dá 404 (`ApiError`). */
export function getProfessionalClosing(
  id: string,
): Promise<ProfessionalClosingReceipt> {
  return proFetch<ProfessionalClosingReceipt>(
    `/professional-app/commission-closings/${encodeURIComponent(id)}`,
  );
}

/** O Início: hoje, a semana, o mês e os próximos agendamentos dele. */
export function getProfessionalHome(): Promise<ProfessionalHome> {
  return proFetch<ProfessionalHome>("/professional-app/home");
}
