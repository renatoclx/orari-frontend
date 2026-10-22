import { CheckoutList } from "@/components/checkouts/CheckoutList";
import { ListSearch } from "@/components/shared/ListSearch";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import { listCheckouts } from "@/services/payment.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { formatDateOnly } from "@/utils/format";
import { toDateString } from "@/utils/time";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/financeiro/comandas";
// Máximo que a API aceita por página: os métodos ativos cabem numa só.
const METHODS_LIMIT = 100;

type CheckoutsListPageProps = {
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Comandas do dia (screens/financeiro.md, Etapa 2): renderizada no servidor,
// com busca e página pela URL. Os métodos ativos vêm junto, para o dialog.
export async function CheckoutsListPage({
  searchParams,
}: CheckoutsListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ company }, result, methods] = await Promise.all([
    getCurrentUser(),
    listCheckouts({ search: search || undefined, page, limit: PAGE_SIZE }),
    listPaymentMethods({ isActive: true, page: 1, limit: METHODS_LIMIT }),
  ]);
  const timeZone = company.timezone;
  // "Hoje" é o dia da empresa, o mesmo que a API usa para montar as comandas.
  const todayIso = toDateString(new Date(), timeZone);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Comandas do dia</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateOnly(`${todayIso}T00:00:00Z`)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ListSearch
          basePath={BASE_PATH}
          search={search}
          label="Buscar comanda pelo nome do cliente"
        />
      </div>
      <CheckoutList
        checkouts={result.items}
        methods={methods.items}
        search={search}
        timeZone={timeZone}
        today={todayIso}
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
