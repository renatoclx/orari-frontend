import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { AuditAction, AuditLogItem } from "@/types/audit";

type ListAuditLogsParams = {
  clientId?: string;
  userId?: string;
  action?: AuditAction;
  /** Início e fim do período, incluídos (a API lê data e hora completas). */
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
};

/** Registros de auditoria da empresa, do mais recente para o mais antigo (só ADMIN). */
export function listAuditLogs(
  params: ListAuditLogsParams,
): Promise<Paginated<AuditLogItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.clientId) query.set("clientId", params.clientId);
  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  if (params.from) query.set("from", params.from.toISOString());
  if (params.to) query.set("to", params.to.toISOString());
  return apiFetch<Paginated<AuditLogItem>>(`/audit-logs?${query}`);
}
