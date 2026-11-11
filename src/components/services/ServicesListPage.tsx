import { ServiceList } from "@/components/services/ServiceList";
import { ServicesToolbar } from "@/components/services/ServicesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { canAccess } from "@/utils/access";
import { listServices } from "@/services/service.service";

// Itens por página da listagem (a API aceita até 100).
const PAGE_SIZE = 10;
const BASE_PATH = "/servicos";

type ServicesListPageProps = {
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de serviços: renderizada no servidor, com busca e página pela URL.
export async function ServicesListPage({
  searchParams,
}: ServicesListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [result, user] = await Promise.all([
    listServices({ name: search || undefined, page, limit: PAGE_SIZE }),
    getCurrentUser(),
  ]);
  // Comissão é remuneração do profissional: só o ADMIN define (e a API só a
  // devolve para ele), e só com Comissões liberadas para a empresa.
  const canSetCommission =
    user.type === "ADMIN" && canAccess(user.access, "commissions");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Serviços</h1>
      <ServicesToolbar search={search} canSetCommission={canSetCommission} />
      <ServiceList
        services={result.items}
        search={search}
        canSetCommission={canSetCommission}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ q: search || undefined }}
          />
        }
      />
    </div>
  );
}
