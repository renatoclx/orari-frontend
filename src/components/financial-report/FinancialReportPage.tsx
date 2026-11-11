import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { FinancialMethodTable } from "@/components/financial-report/FinancialMethodTable";
import { FinancialPeriodChart } from "@/components/financial-report/FinancialPeriodChart";
import { FinancialReportCards } from "@/components/financial-report/FinancialReportCards";
import {
  FINANCIAL_REPORT_PATH,
  financialReportParams,
  financialReportQuery,
  readFinancialReportFilters,
} from "@/components/financial-report/financial-report-filters";
import { FinancialReportToolbar } from "@/components/financial-report/FinancialReportToolbar";
import { ReceivedPaymentList } from "@/components/financial-report/ReceivedPaymentList";
import { PrintButton } from "@/components/shared/PrintButton";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getFinancialReport,
  listReceivedPayments,
} from "@/services/financial-report.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { fetchAllPages } from "@/utils/fetch-all-pages";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;

/**
 * Relatório financeiro (screens/relatorio-financeiro.md): renderizado no
 * servidor, com método, período e página pela URL.
 */
export async function FinancialReportPage({
  searchParams,
}: {
  /** ?metodo=, ?de=, ?ate= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Ativos e inativos: um método inativo pode ter recebido no período.
  const [{ company }, methods] = await Promise.all([
    getCurrentUser(),
    fetchAllPages((page, limit) => listPaymentMethods({ page, limit })),
  ]);
  const month = monthOf(toDateString(new Date(), company.timezone));
  const options = methods.map(({ id, name }) => ({ id, name }));
  const filters = readFinancialReportFilters(
    searchParams,
    options.map((option) => option.id),
  );
  const query = financialReportQuery(filters, month).toString();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const params = financialReportParams(filters);

  const [report, result] = await Promise.all([
    getFinancialReport(params),
    listReceivedPayments({ ...params, page, limit: PAGE_SIZE }),
  ]);

  // relative: os absolutos de dentro (sr-only, dicas dos gráficos) não
  // esticam a página além da rolagem própria.
  return (
    <div className="relative -m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            O que entrou no caixa, por dia e por método de pagamento.
          </p>
        </div>
        {/* A impressão leva os mesmos filtros e o extrato inteiro. */}
        <PrintButton
          href={`${FINANCIAL_REPORT_PATH}/imprimir${query ? `?${query}` : ""}`}
        />
      </div>
      <FinancialReportToolbar
        filters={filters}
        month={month}
        methods={options}
      />
      <FinancialReportCards report={report} />
      <div className="grid gap-3 xl:grid-cols-2">
        <FinancialPeriodChart series={report.series} />
        <FinancialMethodTable methods={report.byMethod} />
      </div>
      {/* Com os gráficos, a página rola como um painel; o extrato mantém uma
          altura mínima e rola por dentro. */}
      <div className="flex min-h-[28rem] flex-1 flex-col">
        <ReceivedPaymentList
          payments={result.items}
          timeZone={company.timezone}
          footer={
            <TablePagination
              page={page}
              limit={PAGE_SIZE}
              total={result.total}
              basePath={FINANCIAL_REPORT_PATH}
              query={Object.fromEntries(new URLSearchParams(query))}
            />
          }
        />
      </div>
    </div>
  );
}
