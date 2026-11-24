import { notFound } from "next/navigation";
import {
  PORTFOLIO_STATUS_BADGES,
  monthOf,
  readPortfolioFilters,
} from "@/components/client-portfolio/portfolio-filters";
import { PortfolioPeriodChart } from "@/components/client-portfolio/PortfolioPeriodChart";
import { PortfolioStatusChart } from "@/components/client-portfolio/PortfolioStatusChart";
import { PortfolioSummaryCards } from "@/components/client-portfolio/PortfolioSummaryCards";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintTable } from "@/components/shared/PrintTable";
import { getCurrentUser } from "@/services/auth.service";
import {
  getPortfolioSummary,
  listPortfolioClients,
} from "@/services/client-portfolio.service";
import { listPeople } from "@/services/people.service";
import { fetchAllPages, MAX_PAGE_SIZE } from "@/utils/fetch-all-pages";
import { formatDateOnly, formatPhone, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/**
 * Carteira de clientes para imprimir (screens/carteira-clientes.md): os
 * mesmos filtros da tela, com a lista inteira do profissional.
 */
export async function ClientPortfolioPrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [{ company }, professionals] = await Promise.all([
    getCurrentUser(),
    listPeople({
      type: "PROFESSIONAL",
      isActive: true,
      page: 1,
      limit: MAX_PAGE_SIZE,
    }),
  ]);
  if (professionals.items.length === 0) notFound();
  const timeZone = company.timezone;
  const month = monthOf(toDateString(new Date(), timeZone));
  const { filters, statusFilter } = readPortfolioFilters(
    searchParams,
    professionals.items.map((item) => item.id),
  );
  const professional = professionals.items.find(
    (item) => item.id === filters.professional,
  )!;
  const period = {
    professionalId: filters.professional,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const [summary, clients] = await Promise.all([
    getPortfolioSummary(period),
    fetchAllPages((page, limit) =>
      listPortfolioClients({
        ...period,
        status: statusFilter.status,
        search: filters.search,
        page,
        limit,
      }),
    ),
  ]);

  const details = [
    `Profissional: ${professional.name}`,
    `Período: ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
    ...(statusFilter.status ? [`Situação: ${statusFilter.label}`] : []),
    ...(filters.search ? [`Busca: ${filters.search}`] : []),
  ];
  const dateOf = (iso: string) => day(toDateString(new Date(iso), timeZone));

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Carteira de clientes"
        companyName={company.name}
        timeZone={timeZone}
        details={details}
      />
      <PortfolioSummaryCards
        summary={summary}
        filters={filters}
        month={month}
      />
      <div className="grid gap-3 print:break-inside-avoid">
        <PortfolioStatusChart
          summary={summary}
          filters={filters}
          month={month}
        />
        <PortfolioPeriodChart series={summary.series} print />
      </div>
      <section className="space-y-2 print:break-before-page">
        <h2 className="font-semibold">Clientes</h2>
        <PrintTable
          columns={[
            "Cliente",
            "Celular",
            "Situação",
            "Último atendimento",
            "Próximo agendamento",
            "No período",
            "Pendente",
          ]}
          emptyMessage="Nenhum cliente para os filtros escolhidos."
          rows={clients.map((client) => [
            client.name,
            client.phone ? formatPhone(client.phone) : "--",
            PORTFOLIO_STATUS_BADGES[client.status].label,
            client.lastCompleted
              ? `${dateOf(client.lastCompleted.startAt)}, ${client.lastCompleted.serviceName}`
              : "--",
            client.nextAt ? dateOf(client.nextAt) : "--",
            client.completedInPeriod,
            Number(client.pending) > 0 ? formatPrice(client.pending) : "--",
          ])}
        />
      </section>
    </>
  );
}
