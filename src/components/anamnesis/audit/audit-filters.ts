import { isUuid } from "@/lib/uuid";
import type { AuditAction } from "@/types/audit";
import { dayBounds, isDateString } from "@/utils/time";

/** Rótulo em português de cada ação, na ordem da lista de filtro. */
export const auditActionLabels: Record<AuditAction, string> = {
  ANAMNESIS_VIEWED: "Ficha visualizada",
  ANAMNESIS_LISTED: "Fichas consultadas",
  ANAMNESIS_ENTRY_CREATED: "Ficha ou acompanhamento registrado",
  ANAMNESIS_PDF_GENERATED: "PDF da ficha gerado",
  ANAMNESIS_TEMPLATE_CREATED: "Modelo de ficha criado",
  ANAMNESIS_TEMPLATE_UPDATED: "Modelo de ficha alterado",
  USER_LINK_CHANGED: "Vínculo de usuário alterado",
};

export const auditActions = Object.keys(auditActionLabels) as AuditAction[];

/** Filtros da tela, como vêm da URL ("aaaa-mm-dd" nas datas). */
export type AuditFilters = {
  clientId?: string;
  userId?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
  page: number;
};

const single = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/**
 * Filtros a partir dos searchParams (?cliente=, ?usuario=, ?acao=, ?de=, ?ate=,
 * ?page=). Valor inválido é ignorado: a URL é de quem digita, não de confiança.
 */
export function parseAuditFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AuditFilters {
  const clientId = single(searchParams.cliente);
  const userId = single(searchParams.usuario);
  const action = single(searchParams.acao);
  const from = single(searchParams.de);
  const to = single(searchParams.ate);
  return {
    clientId: clientId && isUuid(clientId) ? clientId : undefined,
    userId: userId && isUuid(userId) ? userId : undefined,
    action: auditActions.find((item) => item === action),
    from: from && isDateString(from) ? from : undefined,
    to: to && isDateString(to) ? to : undefined,
    page: Math.max(1, Number(single(searchParams.page)) || 1),
  };
}

/**
 * Período para a API: do início do dia inicial ao último instante do dia final,
 * no fuso da empresa (a API lê data e hora completas e inclui as duas pontas).
 */
export function auditPeriod(
  filters: Pick<AuditFilters, "from" | "to">,
  timeZone: string,
): { from?: Date; to?: Date } {
  return {
    from: filters.from ? dayBounds(filters.from, timeZone).from : undefined,
    to: filters.to
      ? new Date(dayBounds(filters.to, timeZone).to.getTime() - 1)
      : undefined,
  };
}

/** Querystring dos filtros (sem a página), só com o que foi escolhido. */
export function auditQuery(
  filters: Omit<AuditFilters, "page">,
): Record<string, string> {
  return {
    ...(filters.clientId && { cliente: filters.clientId }),
    ...(filters.userId && { usuario: filters.userId }),
    ...(filters.action && { acao: filters.action }),
    ...(filters.from && { de: filters.from }),
    ...(filters.to && { ate: filters.to }),
  };
}

/** "2026-10-27T13:29:45.540Z" → "27/10/2026 10:29:45" (no fuso da empresa). */
export function formatAuditDateTime(iso: string, timeZone: string): string {
  return (
    new Intl.DateTimeFormat("pt-BR", {
      timeZone,
      dateStyle: "short",
      timeStyle: "medium",
      hourCycle: "h23",
    })
      .format(new Date(iso))
      // O pt-BR separa data e hora com vírgula.
      .replace(", ", " ")
  );
}

/** O IP chega no formato IPv6 mapeado ("::ffff:10.0.0.1"): mostra o IPv4 puro. */
export function formatAuditIp(ip: string | null): string | null {
  return ip ? ip.replace(/^::ffff:/i, "") : null;
}
