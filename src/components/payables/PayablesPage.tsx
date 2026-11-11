import { NewPayableButton } from "@/components/payables/NewPayableButton";
import { PayableList } from "@/components/payables/PayableList";
import {
  ALL,
  commissionVisibility,
  PAYABLE_FILTERS,
  PAYABLES_PATH,
  payableQuery,
  readPayableFilters,
} from "@/components/payables/payable-filters";
import { OpenCommissions } from "@/components/payables/OpenCommissions";
import { PayablesSummary } from "@/components/payables/PayablesSummary";
import { PayablesToolbar } from "@/components/payables/PayablesToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listExpenseCategories } from "@/services/expense-category.service";
import {
  getPayableCommissions,
  getPayableSummary,
  listPayables,
} from "@/services/payable.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { listPeople } from "@/services/people.service";
import { canAccess } from "@/utils/access";
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

  // Primeiro quem é e as categorias: decidem se a comissão em aberto entra.
  const [user, categories] = await Promise.all([
    getCurrentUser(),
    // Todas: o filtro mostra também as inativas (contas antigas usam).
    listExpenseCategories({ page: 1, limit: LOOKUP_LIMIT }),
  ]);
  const categoryName = categories.items.find(
    (category) => category.id === filters.category,
  )?.name;
  // Comissões em aberto: só com a funcionalidade e quando o filtro as inclui.
  const visibility = canAccess(user.access, "commissions")
    ? commissionVisibility(filters, categoryName)
    : { cards: false, block: false };

  const [result, summary, suppliers, professionals, methods, commissions] =
    await Promise.all([
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
      listPaymentMethods({ isActive: true, page: 1, limit: LOOKUP_LIMIT }),
      visibility.cards
        ? getPayableCommissions(params.payeeId)
        : Promise.resolve([]),
    ]);
  const today = toDateString(new Date(), user.company.timezone);

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
  const commissionsToPay = commissions.reduce(
    (sum, item) => sum + Number(item.toPay),
    0,
  );
  const methodOptions = methods.items.map(({ id, name }) => ({ id, name }));

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
      <PayablesSummary
        summary={summary}
        filters={filters}
        commissionsToPay={commissionsToPay}
      />
      <PayablesToolbar
        filters={filters}
        payees={payees}
        categories={allCategories}
      />
      {/* Montado mesmo sem comissões: guarda o diálogo de fechamento aberto
          depois que o profissional sai do bloco. */}
      {visibility.block && (
        <OpenCommissions
          commissions={commissions}
          methods={methodOptions}
          today={today}
        />
      )}
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
