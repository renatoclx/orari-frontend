import type { ClientPlanItem, ClientPlanStatus } from "@/types/client-plan";

/** Rótulos da situação da contratação. */
export const CLIENT_PLAN_STATUS: Record<ClientPlanStatus, string> = {
  active: "Ativa",
  cancelled: "Cancelada",
  ended: "Encerrada",
};

/**
 * Situação pela mesma regra do filtro da API: cancelada quando tem data de
 * cancelamento; encerrada quando o período já terminou; senão, ativa (inclusive
 * a que ainda vai começar). `today` no fuso da empresa.
 */
export function clientPlanStatus(
  item: Pick<ClientPlanItem, "cancelledAt" | "endDate">,
  today: string,
): ClientPlanStatus {
  if (item.cancelledAt) return "cancelled";
  return item.endDate < today ? "ended" : "active";
}

export const BILLING_LABEL = {
  INTEGRAL: "Integral",
  MONTHLY: "Mensal",
} as const;
