import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { PlanInput, PlanItem } from "@/types/plan";

type ListPlansParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

/** Planos ativos e inativos (o status vem de `isActive`). */
export function listPlans(
  params: ListPlansParams,
): Promise<Paginated<PlanItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }
  return apiFetch<Paginated<PlanItem>>(`/plans?${query}`);
}

export function getPlan(id: string): Promise<PlanItem> {
  return apiFetch<PlanItem>(`/plans/${id}`);
}

/** Cadastro; nome repetido na empresa responde 409. */
export function createPlan(input: PlanInput): Promise<PlanItem> {
  return apiFetch<PlanItem>("/plans", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Alteração: serviços e períodos informados substituem os anteriores. */
export function updatePlan(id: string, input: PlanInput): Promise<PlanItem> {
  return apiFetch<PlanItem>(`/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Não há exclusão de plano: ele é inativado e pode ser reativado. */
export function setPlanActive(
  id: string,
  isActive: boolean,
): Promise<PlanItem> {
  return apiFetch<PlanItem>(`/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
