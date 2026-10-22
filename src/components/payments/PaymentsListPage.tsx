import { PaymentList } from "@/components/payments/PaymentList";
import {
  ALL,
  DEFAULT_PAYMENT_FILTER,
  PAYMENT_FILTERS,
  paymentQuery,
  type PaymentFiltersState,
} from "@/components/payments/payment-filters";
import { PaymentsSummary } from "@/components/payments/PaymentsSummary";
import { PaymentsToolbar } from "@/components/payments/PaymentsToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { getPaymentSummary, listPayments } from "@/services/payment.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { getPerson, listPeople } from "@/services/people.service";
import { isDateString } from "@/utils/time";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/financeiro";
// Máximo que a API aceita por página: os métodos e os primeiros clientes cabem numa só.
const LOOKUP_LIMIT = 100;

type PaymentsListPageProps = {
  /** searchParams da rota (?status=, ?de=, ?ate=, ?cliente=, ?metodo= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

// Data inválida na URL é ignorada, sem quebrar a página.
const date = (value: string | string[] | undefined) =>
  isDateString(text(value)) ? text(value) : "";

// Pagamentos (screens/financeiro.md): renderizada no servidor, com filtros e
// página pela URL. O resumo e a listagem são buscados juntos.
export async function PaymentsListPage({
  searchParams,
}: PaymentsListPageProps) {
  const renderedAt = new Date();
  const filter =
    PAYMENT_FILTERS.find((item) => item.id === searchParams.status) ??
    PAYMENT_FILTERS.find((item) => item.id === DEFAULT_PAYMENT_FILTER)!;
  const filters: PaymentFiltersState = {
    status: filter.id,
    from: date(searchParams.de),
    to: date(searchParams.ate),
    client: text(searchParams.cliente) || ALL,
    method: text(searchParams.metodo) || ALL,
  };
  const clientId = filters.client === ALL ? undefined : filters.client;
  const methodId = filters.method === ALL ? undefined : filters.method;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const period = {
    clientId,
    dueFrom: filters.from || undefined,
    dueTo: filters.to || undefined,
  };

  const [{ company }, result, summary, methods, clients, filteredClient] =
    await Promise.all([
      getCurrentUser(),
      listPayments({
        ...period,
        status: filter.status,
        overdue: "overdue" in filter ? filter.overdue : undefined,
        paymentMethodId: methodId,
        page,
        limit: PAGE_SIZE,
      }),
      getPaymentSummary(period),
      listPaymentMethods({ page: 1, limit: LOOKUP_LIMIT }),
      listPeople({ type: "CLIENT", page: 1, limit: LOOKUP_LIMIT }),
      // O cliente filtrado pode não estar entre os primeiros: busca o nome.
      clientId ? getPerson(clientId).catch(() => undefined) : undefined,
    ]);

  const clientOptions = clients.items
    .filter((client) => client.deletedAt === null)
    .map((client) => ({ id: client.id, name: client.name }));
  if (
    filteredClient &&
    !clientOptions.some((client) => client.id === filteredClient.id)
  ) {
    clientOptions.unshift({ id: filteredClient.id, name: filteredClient.name });
  }

  // A baixa só aceita métodos ativos; o filtro traz também os inativos.
  const activeMethods = methods.items.filter(
    (method) => method.deletedAt === null,
  );
  const query = paymentQuery(filters);
  const queryObject = Object.fromEntries(query);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Pagamentos</h1>
      <PaymentsSummary summary={summary} filters={filters} />
      <PaymentsToolbar
        filters={filters}
        clients={clientOptions}
        methods={methods.items.map((method) => ({
          id: method.id,
          name: method.name,
        }))}
      />
      <PaymentList
        payments={result.items}
        methods={activeMethods}
        filtered={query.size > 0}
        timeZone={company.timezone}
        serverNow={renderedAt.getTime()}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={queryObject}
          />
        }
      />
    </div>
  );
}
