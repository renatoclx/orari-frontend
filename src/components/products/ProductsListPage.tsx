import Link from "next/link";
import { Plus } from "lucide-react";
import { Can } from "@/components/layout/Access";
import { ProductList } from "@/components/products/ProductList";
import { Button } from "@/components/ui/button";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import {
  PRODUCTS_PATH,
  productApiFilters,
  productQuery,
  readProductFilters,
} from "@/components/products/product-filters";
import type { PurchasePayableContext } from "@/components/products/StockMovementDialog";
import { TablePagination } from "@/components/shared/TablePagination";
import { listExpenseCategories } from "@/services/expense-category.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { listPeople } from "@/services/people.service";
import { listProductCategories } from "@/services/product-category.service";
import { listProducts } from "@/services/product.service";
import type { CurrentUser } from "@/types/auth";
import { canAccess } from "@/utils/access";
import { toDateString } from "@/utils/time";

// Itens por página da listagem.
const PAGE_SIZE = 10;
// Opções dos filtros de categoria e fornecedor (a API aceita até 100).
const LOOKUP_LIMIT = 100;

type ProductsListPageProps = {
  /** searchParams da rota (?q=, ?categoria=, ?fornecedor=, ?status= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
  /** Quem está logado: o acesso da empresa e o fuso. */
  user: CurrentUser;
};

const EMPTY = { items: [], total: 0, page: 1, limit: 0 };

// Listagem de produtos (só ADMIN): renderizada no servidor, com busca, filtros
// e página pela URL.
export async function ProductsListPage({
  searchParams,
  user,
}: ProductsListPageProps) {
  const filters = readProductFilters(searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);

  // A compra só lança conta a pagar com o Contas a pagar (e as categorias
  // de despesa) no plano; "Já está paga" pede os métodos de pagamento.
  const canPayable =
    canAccess(user.access, "payables", "create") &&
    canAccess(user.access, "expense-categories");
  const canMethods = canAccess(user.access, "payment-methods");

  const [result, categories, suppliers, expenseCategories, methods] =
    await Promise.all([
      listProducts({ ...productApiFilters(filters), page, limit: PAGE_SIZE }),
      // Todas as categorias, inclusive as inativas: produtos antigos ainda usam.
      listProductCategories({ page: 1, limit: LOOKUP_LIMIT }),
      listPeople({
        type: "SUPPLIER",
        isActive: true,
        page: 1,
        limit: LOOKUP_LIMIT,
      }),
      canPayable
        ? listExpenseCategories({
            isActive: true,
            page: 1,
            limit: LOOKUP_LIMIT,
          })
        : EMPTY,
      canPayable && canMethods
        ? listPaymentMethods({ isActive: true, page: 1, limit: LOOKUP_LIMIT })
        : EMPTY,
    ]);
  const payable: PurchasePayableContext | null = canPayable
    ? {
        categories: expenseCategories.items.map(({ id, name }) => ({
          id,
          name,
        })),
        suppliers: suppliers.items.map((person) => ({
          id: person.id,
          name: person.name,
          categoryId: person.expenseCategoryId ?? null,
        })),
        methods: methods.items,
        today: toDateString(new Date(), user.company.timezone),
      }
    : null;
  const query = Object.fromEntries(productQuery(filters));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Novo produto ao lado do título (como em Contas a pagar): a barra
          de filtros cabe numa linha. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Can feature="products" action="create">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`${PRODUCTS_PATH}/novo`}>
              <Plus aria-hidden="true" />
              Novo produto
            </Link>
          </Button>
        </Can>
      </div>
      <ProductsToolbar
        filters={filters}
        categories={categories.items.map(({ id, name }) => ({ id, name }))}
        suppliers={suppliers.items.map(({ id, name }) => ({ id, name }))}
      />
      <ProductList
        products={result.items}
        payable={payable}
        timeZone={user.company.timezone}
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
