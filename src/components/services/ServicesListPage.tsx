import { ServiceList } from "@/components/services/ServiceList";
import { ServicesToolbar } from "@/components/services/ServicesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { listServices } from "@/services/service.service";

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

  const result = await listServices({
    name: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Serviços</h1>
      <ServicesToolbar search={search} />
      <ServiceList
        services={result.items}
        search={search}
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
