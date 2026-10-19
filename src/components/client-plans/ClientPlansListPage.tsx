import { ClientPlanList } from "@/components/client-plans/ClientPlanList";
import { ClientPlansToolbar } from "@/components/client-plans/ClientPlansToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listClientPlans } from "@/services/client-plan.service";
import { getPerson, listPeople } from "@/services/people.service";
import { listPlans } from "@/services/plan.service";
import type { ClientPlanStatus } from "@/types/client-plan";
import { toDateString } from "@/utils/time";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/pacotes/contratacoes";
const STATUSES: ClientPlanStatus[] = ["active", "cancelled", "ended"];

type ClientPlansListPageProps = {
  /** searchParams da rota (?client=, ?plan=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

const param = (value: string | string[] | undefined) =>
  typeof value === "string" && value ? value : undefined;

// Listagem de contratações: renderizada no servidor, com filtros e página pela URL.
export async function ClientPlansListPage({
  searchParams,
}: ClientPlansListPageProps) {
  const clientId = param(searchParams.client);
  const planId = param(searchParams.plan);
  const status = STATUSES.find((item) => item === searchParams.status);
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ company }, result, plans, clients, filteredClient] =
    await Promise.all([
      getCurrentUser(),
      listClientPlans({ clientId, planId, status, page, limit: PAGE_SIZE }),
      listPlans({ page: 1, limit: 100 }),
      listPeople({ type: "CLIENT", page: 1, limit: 100 }),
      // O cliente filtrado pode não estar entre os primeiros: busca o nome.
      clientId ? getPerson(clientId).catch(() => undefined) : undefined,
    ]);

  const clientOptions = clients.items
    .filter((client) => client.deletedAt === null)
    .map((client) => ({ id: client.id, name: client.name }));
  if (
    filteredClient &&
    !clientOptions.some((c) => c.id === filteredClient.id)
  ) {
    clientOptions.unshift({ id: filteredClient.id, name: filteredClient.name });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Contratações</h1>
      <ClientPlansToolbar
        filters={{
          client: clientId ?? "all",
          plan: planId ?? "all",
          status: status ?? "all",
        }}
        clients={clientOptions}
        plans={plans.items.map((plan) => ({ id: plan.id, name: plan.name }))}
      />
      <ClientPlanList
        items={result.items}
        today={toDateString(new Date(), company.timezone)}
        filtered={Boolean(clientId || planId || status)}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ client: clientId, plan: planId, status }}
          />
        }
      />
    </div>
  );
}
