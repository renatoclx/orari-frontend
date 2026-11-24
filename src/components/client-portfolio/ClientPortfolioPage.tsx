import { PortfolioClientList } from "@/components/client-portfolio/PortfolioClientList";
import { PortfolioPeriodChart } from "@/components/client-portfolio/PortfolioPeriodChart";
import { PortfolioStatusChart } from "@/components/client-portfolio/PortfolioStatusChart";
import {
  DEFAULT_STATUS_FILTER,
  PORTFOLIO_PATH,
  monthOf,
  portfolioQuery,
  readPortfolioFilters,
} from "@/components/client-portfolio/portfolio-filters";
import { PortfolioSummaryCards } from "@/components/client-portfolio/PortfolioSummaryCards";
import { PortfolioToolbar } from "@/components/client-portfolio/PortfolioToolbar";
import { PrintButton } from "@/components/shared/PrintButton";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getPortfolioSummary,
  listPortfolioClients,
} from "@/services/client-portfolio.service";
import { listPeople } from "@/services/people.service";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;
// Máximo da API por página: os profissionais cabem numa só.
const LOOKUP_LIMIT = 100;

type ClientPortfolioPageProps = {
  /** ?profissional=, ?de=, ?ate=, ?situacao=, ?q= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Carteira de clientes (screens/carteira-clientes.md): renderizada no
 * servidor, com filtros e página pela URL. Valor inválido na URL é ignorado.
 */
export async function ClientPortfolioPage({
  searchParams,
}: ClientPortfolioPageProps) {
  const [{ company }, professionals] = await Promise.all([
    getCurrentUser(),
    listPeople({
      type: "PROFESSIONAL",
      isActive: true,
      page: 1,
      limit: LOOKUP_LIMIT,
    }),
  ]);
  const month = monthOf(toDateString(new Date(), company.timezone));
  const options = professionals.items.map(({ id, name }) => ({ id, name }));

  const header = (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold">Carteira de clientes</h1>
      <p className="text-sm text-muted-foreground">
        Quem cada profissional atende, quem é novo e quem deixou de vir.
      </p>
    </div>
  );

  if (options.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {header}
        <p className="flex flex-1 items-center justify-center rounded-card border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum profissional ativo. Cadastre o primeiro em Profissionais.
        </p>
      </div>
    );
  }

  const { filters, statusFilter } = readPortfolioFilters(
    searchParams,
    options.map((option) => option.id),
  );
  const query = portfolioQuery(filters, month).toString();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const period = {
    professionalId: filters.professional,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const [summary, result] = await Promise.all([
    getPortfolioSummary(period),
    listPortfolioClients({
      ...period,
      status: statusFilter.status,
      search: filters.search,
      page,
      limit: PAGE_SIZE,
    }),
  ]);

  // relative: os absolutos de dentro (sr-only, dicas dos gráficos) não
  // esticam a página além da rolagem própria.
  return (
    <div className="relative -m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {header}
        {/* A impressão leva os mesmos filtros e a lista inteira. */}
        <PrintButton href={`${PORTFOLIO_PATH}/imprimir?${query}`} />
      </div>
      <PortfolioToolbar
        filters={filters}
        month={month}
        professionals={options}
      />
      <PortfolioSummaryCards
        summary={summary}
        filters={filters}
        month={month}
      />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <PortfolioStatusChart
          summary={summary}
          filters={filters}
          month={month}
        />
        <PortfolioPeriodChart series={summary.series} />
      </div>
      {/* Com os gráficos, a página rola como um painel; a lista mantém uma
          altura mínima e rola por dentro. */}
      <div className="flex min-h-[28rem] flex-1 flex-col">
        <PortfolioClientList
          clients={result.items}
          filtered={
            filters.status !== DEFAULT_STATUS_FILTER || filters.search !== ""
          }
          timeZone={company.timezone}
          footer={
            <TablePagination
              page={page}
              limit={PAGE_SIZE}
              total={result.total}
              basePath={PORTFOLIO_PATH}
              query={Object.fromEntries(new URLSearchParams(query))}
            />
          }
        />
      </div>
    </div>
  );
}
