import { NewPayableButton } from "@/components/payables/NewPayableButton";
import { PayableList } from "@/components/payables/PayableList";
import {
  ALL,
  PAYABLE_FILTERS,
  PAYABLES_PATH,
  payableQuery,
  readPayableFilters,
} from "@/components/payables/payable-filters";
import { PayablesSummary } from "@/components/payables/PayablesSummary";
import { PayablesToolbar } from "@/components/payables/PayablesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listExpenseCategories } from "@/services/expense-category.service";
import { getPayableSummary, listPayables } from "@/services/payable.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { listPeople } from "@/services/people.service";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;
// Máximo da API por página: favorecidos, categorias e métodos cabem numa só.
const LOOKUP_LIMIT = 100;

/**
 * Contas a pagar (screens/contas-a-pagar.md): renderizada no servidor, com
 * filtros e página pela URL; resumo e lista buscados juntos.
 */
export async function PayablesPage({
  searchParams,
}: {
  /** ?status=, ?de=, ?ate=, ?favorecido=, ?categoria= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = readPayableFilters(searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const params = {
    payeeId: filters.payee === ALL ? undefined : filters.payee,
    categoryId: filters.category === ALL ? undefined : filters.category,
    dueFrom: filters.from || undefined,
    dueTo: filters.to || undefined,
  };
  const api = PAYABLE_FILTERS.find((item) => item.id === filters.status)!.api;

  const [
    { company },
    result,
    summary,
    suppliers,
    professionals,
    categories,
    methods,
  ] = await Promise.all([
    getCurrentUser(),
    listPayables({ ...params, status: api, page, limit: PAGE_SIZE }),
    getPayableSummary(params),
    listPeople({
      type: "SUPPLIER",
      isActive: true,
      page: 1,
      limit: LOOKUP_LIMIT,
    }),
    listPeople({
      type: "PROFESSIONAL",
      isActive: true,
      page: 1,
      limit: LOOKUP_LIMIT,
    }),
    // Todas: o filtro mostra também as inativas (contas antigas usam).
    listExpenseCategories({ page: 1, limit: LOOKUP_LIMIT }),
    listPaymentMethods({ isActive: true, page: 1, limit: LOOKUP_LIMIT }),
  ]);
  const today = toDateString(new Date(), company.timezone);

  // Favorecidos: fornecedores (com a categoria principal) e profissionais.
  const payees = [
    ...suppliers.items.map((person) => ({
      id: person.id,
      name: person.name,
      type: "SUPPLIER" as const,
      categoryId: person.expenseCategoryId ?? null,
    })),
    ...professionals.items.map((person) => ({
      id: person.id,
      name: person.name,
      type: "PROFESSIONAL" as const,
      categoryId: null,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const allCategories = categories.items.map(({ id, name }) => ({ id, name }));
  const activeCategories = categories.items
    .filter((category) => category.deletedAt === null)
    .map(({ id, name }) => ({ id, name }));
  const query = payableQuery(filters);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Contas a pagar</h1>
          <p className="text-sm text-muted-foreground">
            As despesas da empresa: o que vence, o que atrasou e o que já foi
            pago.
          </p>
        </div>
        <NewPayableButton
          payees={payees}
          categories={activeCategories}
          methods={methods.items}
          today={today}
        />
      </div>
      <PayablesSummary summary={summary} filters={filters} />
      <PayablesToolbar
        filters={filters}
        payees={payees}
        categories={allCategories}
      />
      <PayableList
        payables={result.items}
        payees={payees}
        categories={activeCategories}
        methods={methods.items}
        today={today}
        filtered={query.size > 0}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={PAYABLES_PATH}
            query={Object.fromEntries(query)}
          />
        }
      />
    </div>
  );
}
