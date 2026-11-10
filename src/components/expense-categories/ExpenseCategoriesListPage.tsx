import { ExpenseCategoryList } from "@/components/expense-categories/ExpenseCategoryList";
import { ExpenseCategoriesToolbar } from "@/components/expense-categories/ExpenseCategoriesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { listExpenseCategories } from "@/services/expense-category.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/financeiro/categorias-de-despesa";

type ExpenseCategoriesListPageProps = {
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de categorias de despesa (só ADMIN): renderizada no servidor, com busca e página pela URL.
export async function ExpenseCategoriesListPage({
  searchParams,
}: ExpenseCategoriesListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listExpenseCategories({
    name: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Categorias de despesa</h1>
      <ExpenseCategoriesToolbar search={search} />
      <ExpenseCategoryList
        categories={result.items}
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
