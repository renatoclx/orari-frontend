import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { ReceivablesAgingChart } from "@/components/receivables/ReceivablesAgingChart";
import { ReceivablesDebtorList } from "@/components/receivables/ReceivablesDebtorList";
import {
  RECEIVABLES_PATH,
  readReceivablesFilters,
  receivablesQuery,
} from "@/components/receivables/receivables-filters";
import { ReceivablesMonthsChart } from "@/components/receivables/ReceivablesMonthsChart";
import { ReceivablesSummaryCards } from "@/components/receivables/ReceivablesSummaryCards";
import { ReceivablesToolbar } from "@/components/receivables/ReceivablesToolbar";
import { PrintButton } from "@/components/shared/PrintButton";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getReceivablesSummary,
  listReceivablesDebtors,
} from "@/services/receivables.service";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;

type ReceivablesPageProps = {
  /** ?de=, ?ate=, ?q= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Contas a receber (screens/contas-a-receber.md): renderizada no servidor,
 * com período, busca e página pela URL. Valor inválido na URL é ignorado.
 */
export async function ReceivablesPage({ searchParams }: ReceivablesPageProps) {
  const { company } = await getCurrentUser();
  const today = toDateString(new Date(), company.timezone);
  const month = monthOf(today);

  const filters = readReceivablesFilters(searchParams);
  const query = receivablesQuery(filters, month).toString();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [summary, result] = await Promise.all([
    getReceivablesSummary({
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    listReceivablesDebtors({ search: filters.search, page, limit: PAGE_SIZE }),
  ]);

  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Contas a receber</h1>
          <p className="text-sm text-muted-foreground">
            O que há para receber, o que está atrasado e há quanto tempo.
          </p>
        </div>
        {/* A impressão leva os mesmos filtros e a lista inteira. */}
        <PrintButton
          href={`${RECEIVABLES_PATH}/imprimir${query ? `?${query}` : ""}`}
        />
      </div>
      <ReceivablesToolbar filters={filters} month={month} />
      <ReceivablesSummaryCards summary={summary} />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <ReceivablesAgingChart aging={summary.aging} />
        <ReceivablesMonthsChart months={summary.months} />
      </div>
      {/* Com os gráficos, a página rola como um painel; a lista mantém uma
          altura mínima e rola por dentro. */}
      <div className="flex min-h-[28rem] flex-1 flex-col">
        <ReceivablesDebtorList
          debtors={result.items}
          filtered={filters.search !== ""}
          today={today}
          footer={
            <TablePagination
              page={page}
              limit={PAGE_SIZE}
              total={result.total}
              basePath={RECEIVABLES_PATH}
              query={Object.fromEntries(new URLSearchParams(query))}
            />
          }
        />
      </div>
    </div>
  );
}
