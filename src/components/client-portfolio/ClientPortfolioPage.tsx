import { PortfolioClientList } from "@/components/client-portfolio/PortfolioClientList";
import { PortfolioPeriodChart } from "@/components/client-portfolio/PortfolioPeriodChart";
import { PortfolioStatusChart } from "@/components/client-portfolio/PortfolioStatusChart";
import {
  DEFAULT_STATUS_FILTER,
  PORTFOLIO_PATH,
  PORTFOLIO_STATUS_FILTERS,
  monthOf,
  portfolioQuery,
  type PortfolioFiltersState,
} from "@/components/client-portfolio/portfolio-filters";
import { PortfolioSummaryCards } from "@/components/client-portfolio/PortfolioSummaryCards";
import { PortfolioToolbar } from "@/components/client-portfolio/PortfolioToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getPortfolioSummary,
  listPortfolioClients,
} from "@/services/client-portfolio.service";
import { listPeople } from "@/services/people.service";
import { isDateString, toDateString } from "@/utils/time";

const PAGE_SIZE = 10;
// Máximo da API por página: os profissionais cabem numa só.
const LOOKUP_LIMIT = 100;

type ClientPortfolioPageProps = {
  /** ?profissional=, ?de=, ?ate=, ?situacao=, ?q= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
};

const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

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

  // Período só vale com as duas datas; fim antes do início é ignorado.
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  const statusFilter =
    PORTFOLIO_STATUS_FILTERS.find(
      (item) => item.id === searchParams.situacao,
    ) ??
    PORTFOLIO_STATUS_FILTERS.find((item) => item.id === DEFAULT_STATUS_FILTER)!;
  const chosen = text(searchParams.profissional);
  const filters: PortfolioFiltersState = {
    // Sem escolha (ou inválida), o primeiro profissional da lista.
    professional: options.some((option) => option.id === chosen)
      ? chosen
      : options[0].id,
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
    status: statusFilter.id,
    search: text(searchParams.q),
  };
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

  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      {header}
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
              query={Object.fromEntries(portfolioQuery(filters, month))}
            />
          }
        />
      </div>
    </div>
  );
}
