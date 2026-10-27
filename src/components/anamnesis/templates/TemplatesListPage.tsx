import { TemplateList } from "@/components/anamnesis/templates/TemplateList";
import { TemplatesToolbar } from "@/components/anamnesis/templates/TemplatesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { requireAnamnesisAdmin } from "@/lib/anamnesis-guard";
import { listTemplates } from "@/services/anamnesis-template.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/anamnese/modelos";

type TemplatesListPageProps = {
  /** searchParams da rota (?q=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de modelos de ficha (só ADMIN): renderizada no servidor, com busca,
// status e página pela URL.
export async function TemplatesListPage({
  searchParams,
}: TemplatesListPageProps) {
  await requireAnamnesisAdmin();

  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listTemplates({
    name: search || undefined,
    isActive: status && status === "active",
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Modelos de ficha</h1>
      <TemplatesToolbar search={search} status={status ?? "all"} />
      <TemplateList
        templates={result.items}
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
