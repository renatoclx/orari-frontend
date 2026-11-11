import { ProductList } from "@/components/products/ProductList";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import {
  PRODUCTS_PATH,
  productApiFilters,
  productQuery,
  readProductFilters,
} from "@/components/products/product-filters";
import { TablePagination } from "@/components/shared/TablePagination";
import { listPeople } from "@/services/people.service";
import { listProductCategories } from "@/services/product-category.service";
import { listProducts } from "@/services/product.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
// Opções dos filtros de categoria e fornecedor (a API aceita até 100).
const LOOKUP_LIMIT = 100;

type ProductsListPageProps = {
  /** searchParams da rota (?q=, ?categoria=, ?fornecedor=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de produtos (só ADMIN): renderizada no servidor, com busca, filtros
// e página pela URL.
export async function ProductsListPage({
  searchParams,
}: ProductsListPageProps) {
  const filters = readProductFilters(searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [result, categories, suppliers] = await Promise.all([
    listProducts({ ...productApiFilters(filters), page, limit: PAGE_SIZE }),
    // Todas as categorias, inclusive as inativas: produtos antigos ainda usam.
    listProductCategories({ page: 1, limit: LOOKUP_LIMIT }),
    listPeople({
      type: "SUPPLIER",
      isActive: true,
      page: 1,
      limit: LOOKUP_LIMIT,
    }),
  ]);
  const query = Object.fromEntries(productQuery(filters));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Produtos</h1>
      <ProductsToolbar
        filters={filters}
        categories={categories.items.map(({ id, name }) => ({ id, name }))}
        suppliers={suppliers.items.map(({ id, name }) => ({ id, name }))}
      />
      <ProductList
        products={result.items}
        filtered={Object.keys(query).length > 0}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={PRODUCTS_PATH}
            query={query}
          />
        }
      />
    </div>
  );
}
