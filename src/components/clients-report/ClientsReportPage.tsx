import { BirthdayList } from "@/components/clients-report/BirthdayList";
import { ClientsReportCards } from "@/components/clients-report/ClientsReportCards";
import { ClientsReportDistributions } from "@/components/clients-report/ClientsReportDistributions";
import {
  CLIENTS_REPORT_PATH,
  clientsReportQuery,
  readClientsReportFilters,
} from "@/components/clients-report/clients-report-filters";
import { ClientsReportToolbar } from "@/components/clients-report/ClientsReportToolbar";
import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { PrintButton } from "@/components/shared/PrintButton";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getClientsReport,
  listBirthdays,
} from "@/services/clients-report.service";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;

/**
 * Perfil do cliente (screens/relatorio-perfil-cliente.md): renderizado no
 * servidor, com período e página pela URL.
 */
export async function ClientsReportPage({
  searchParams,
}: {
  /** ?de=, ?ate= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const filters = readClientsReportFilters(searchParams);
  const query = clientsReportQuery(filters, month).toString();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const period = {
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const [report, birthdays] = await Promise.all([
    getClientsReport(period),
    listBirthdays({ ...period, page, limit: PAGE_SIZE }),
  ]);

  // relative: os absolutos de dentro (sr-only, dicas dos gráficos) não
  // esticam a página além da rolagem própria.
  return (
    <div className="relative -m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Perfil do cliente</h1>
          <p className="text-sm text-muted-foreground">
            Quantos clientes estão voltando, como agendam, o que consomem e quem
            faz aniversário.
          </p>
        </div>
        {/* A impressão leva o mesmo período e a lista inteira. */}
        <PrintButton
          href={`${CLIENTS_REPORT_PATH}/imprimir${query ? `?${query}` : ""}`}
        />
      </div>
      <ClientsReportToolbar filters={filters} month={month} />
      <ClientsReportCards report={report} />
      <ClientsReportDistributions report={report} />
      {/* A lista mantém uma altura mínima e rola por dentro. */}
      <div className="flex min-h-[28rem] flex-1 flex-col">
        <BirthdayList
          clients={birthdays.items}
          footer={
            <TablePagination
              page={page}
              limit={PAGE_SIZE}
              total={birthdays.total}
              basePath={CLIENTS_REPORT_PATH}
              query={Object.fromEntries(new URLSearchParams(query))}
            />
          }
        />
      </div>
    </div>
  );
}
