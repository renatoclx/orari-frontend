import {
  auditActionLabels,
  auditActorName,
  auditTargetName,
  formatAuditDateTime,
  formatAuditIp,
} from "@/components/anamnesis/audit/audit-filters";
import { EmptyValue } from "@/components/shared/EmptyValue";
import type { AuditLogItem } from "@/types/audit";

type AuditListProps = {
  logs: AuditLogItem[];
  /** Nome do usuário e do cliente, pelo id (a API devolve só os ids). */
  userNames: Record<string, string>;
  clientNames: Record<string, string>;
  timeZone: string;
  /** Há filtro aplicado, para a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

/** Registros de auditoria (só leitura): quando, quem, o quê e de qual cliente. */
export function AuditList({
  logs,
  userNames,
  clientNames,
  timeZone,
  filtered,
  footer,
}: AuditListProps) {
  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium text-muted-foreground";
  const userOf = (log: AuditLogItem) => auditActorName(log, userNames);
  const targetOf = (log: AuditLogItem) => auditTargetName(log, userNames);
  const clientOf = (log: AuditLogItem) =>
    log.clientId ? (clientNames[log.clientId] ?? "Cliente desconhecido") : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
      <div className="min-h-0 flex-1 overflow-auto">
        {logs.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhum registro encontrado para os filtros."
              : "Nenhum registro de auditoria ainda."}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {logs.map((log) => (
                <li key={log.id} className="space-y-0.5 p-4 text-sm">
                  <p className="font-medium">{auditActionLabels[log.action]}</p>
                  <p className="text-muted-foreground tabular-nums">
                    {formatAuditDateTime(log.createdAt, timeZone)}
                  </p>
                  <p>
                    {userOf(log)}
                    {clientOf(log) && ` · ${clientOf(log)}`}
                    {targetOf(log) && ` · ${targetOf(log)}`}
                  </p>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  {[
                    "Data e hora",
                    "Usuário",
                    "Ação",
                    "Cliente",
                    "Alvo",
                    "IP",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatAuditDateTime(log.createdAt, timeZone)}
                    </td>
                    <td className="px-4 py-3">{userOf(log)}</td>
                    <td className="px-4 py-3">
                      {auditActionLabels[log.action]}
                    </td>
                    <td className="px-4 py-3">
                      <EmptyValue>{clientOf(log)}</EmptyValue>
                    </td>
                    <td className="px-4 py-3">
                      <EmptyValue>{targetOf(log)}</EmptyValue>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <EmptyValue>{formatAuditIp(log.ip)}</EmptyValue>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}
    </div>
  );
}
