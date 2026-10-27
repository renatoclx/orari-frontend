import { notFound } from "next/navigation";
import { AuditFilters } from "@/components/anamnesis/audit/AuditFilters";
import { AuditList } from "@/components/anamnesis/audit/AuditList";
import {
  auditPeriod,
  auditQuery,
  parseAuditFilters,
} from "@/components/anamnesis/audit/audit-filters";
import { TablePagination } from "@/components/shared/TablePagination";
import { requireAnamnesisAdmin } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { listAuditLogs } from "@/services/audit.service";
import { getPerson, listPeople } from "@/services/people.service";
import { listUsers } from "@/services/user.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/anamnese/auditoria";

type AuditPageProps = {
  /** searchParams da rota (?cliente=, ?usuario=, ?acao=, ?de=, ?ate= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Nome de um cliente, ou nulo se não puder ser lido (a tela mostra "desconhecido").
async function clientName(id: string): Promise<[string, string] | null> {
  try {
    return [id, (await getPerson(id)).name];
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

/**
 * Auditoria da anamnese (só ADMIN, só leitura): quem fez o quê e quando, com
 * filtros por cliente, usuário, ação e período. A API devolve só ids; os nomes
 * vêm da lista de usuários e de uma busca por cliente da página.
 */
export async function AuditPage({ searchParams }: AuditPageProps) {
  const user = await requireAnamnesisAdmin();
  const timeZone = user.company.timezone;
  const { page, ...filters } = parseAuditFilters(searchParams);

  const [logs, users, initialClients] = await Promise.all([
    listAuditLogs({
      clientId: filters.clientId,
      userId: filters.userId,
      action: filters.action,
      ...auditPeriod(filters, timeZone),
      page,
      limit: PAGE_SIZE,
    }),
    // Até 100 usuários: serve ao filtro e aos nomes da tabela.
    listUsers({ page: 1, limit: 100 }),
    listPeople({ type: "CLIENT", isActive: true, page: 1, limit: 20 }),
  ]);

  // Clientes da página (e o do filtro): um nome por id, sem repetir.
  const clientIds = [
    ...new Set([
      ...(filters.clientId ? [filters.clientId] : []),
      ...logs.items.flatMap((log) => (log.clientId ? [log.clientId] : [])),
    ]),
  ];
  const clientNames = Object.fromEntries(
    (await Promise.all(clientIds.map(clientName))).flatMap((entry) =>
      entry ? [entry] : [],
    ),
  );
  if (filters.clientId && !(filters.clientId in clientNames)) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Quem consultou ou alterou os dados da anamnese. Somente leitura.
        </p>
      </div>

      <AuditFilters
        filters={filters}
        users={users.items.map((item) => ({ id: item.id, name: item.name }))}
        initialClients={initialClients.items.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        pickedClient={
          filters.clientId
            ? { id: filters.clientId, name: clientNames[filters.clientId] }
            : undefined
        }
      />

      <AuditList
        logs={logs.items}
        userNames={Object.fromEntries(
          users.items.map((item) => [item.id, item.name]),
        )}
        clientNames={clientNames}
        timeZone={timeZone}
        filtered={Object.keys(auditQuery(filters)).length > 0}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={logs.total}
            basePath={BASE_PATH}
            query={auditQuery(filters)}
          />
        }
      />
    </div>
  );
}
