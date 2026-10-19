import { PlanList } from "@/components/plans/PlanList";
import { PlansToolbar } from "@/components/plans/PlansToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { listPlans } from "@/services/plan.service";

// Itens por página da listagem (a API aceita até 100).
const PAGE_SIZE = 10;
const BASE_PATH = "/pacotes/planos";

type PlansListPageProps = {
  /** searchParams da rota (?q=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de planos: renderizada no servidor, com busca, status e página pela URL.
export async function PlansListPage({ searchParams }: PlansListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listPlans({
    name: search || undefined,
    isActive: status && status === "active",
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Planos</h1>
      <PlansToolbar search={search} status={status ?? "all"} />
      <PlanList
        plans={result.items}
        filtered={Boolean(search || status)}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ q: search || undefined, status }}
          />
        }
      />
    </div>
  );
}
