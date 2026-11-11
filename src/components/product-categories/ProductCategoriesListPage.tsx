import { ProductCategoriesToolbar } from "@/components/product-categories/ProductCategoriesToolbar";
import { ProductCategoryList } from "@/components/product-categories/ProductCategoryList";
import { TablePagination } from "@/components/shared/TablePagination";
import { listProductCategories } from "@/services/product-category.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/produtos/categorias";

type ProductCategoriesListPageProps = {
  /** searchParams da rota (?q=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de categorias de produto (só ADMIN): renderizada no servidor, com
// busca, situação e página pela URL.
export async function ProductCategoriesListPage({
  searchParams,
}: ProductCategoriesListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  // Valor fora da lista é ignorado (todas).
  const status =
    searchParams.status === "active" || searchParams.status === "inactive"
      ? searchParams.status
      : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listProductCategories({
    name: search || undefined,
    isActive: status && status === "active",
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Categorias de produto</h1>
      <ProductCategoriesToolbar search={search} status={status ?? "all"} />
      <ProductCategoryList
        categories={result.items}
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
