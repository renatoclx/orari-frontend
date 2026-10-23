import { notFound } from "next/navigation";
import { CompaniesToolbar } from "@/components/companies/CompaniesToolbar";
import { CompanyList } from "@/components/companies/CompanyList";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listCompanies } from "@/services/company.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/empresas";

/** Filtro de status da URL (?status=): sem ele, ativas e inativas. */
export const COMPANY_STATUS_FILTERS = [
  { id: "todas", label: "Todas as empresas", isActive: undefined },
  { id: "ativas", label: "Ativas", isActive: true },
  { id: "inativas", label: "Inativas", isActive: false },
] as const;

type CompaniesListPageProps = {
  /** searchParams da rota (?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Empresas (screens/empresas.md): só o SUPER_ADMIN. Quem não é recebe 404, como se
// a tela não existisse (a API também recusa). A página é renderizada no servidor,
// com o status e a página pela URL.
export async function CompaniesListPage({
  searchParams,
}: CompaniesListPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser.type !== "SUPER_ADMIN") notFound();

  const filter =
    COMPANY_STATUS_FILTERS.find((item) => item.id === searchParams.status) ??
    COMPANY_STATUS_FILTERS[0];
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listCompanies({
    isActive: filter.isActive,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Empresas</h1>
      <CompaniesToolbar status={filter.id} currentUserId={currentUser.id} />
      <CompanyList
        companies={result.items}
        ownCompanyId={currentUser.company.id}
        currentUserId={currentUser.id}
        filtered={filter.isActive !== undefined}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ status: filter.id === "todas" ? undefined : filter.id }}
          />
        }
      />
    </div>
  );
}
