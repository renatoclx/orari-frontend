import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { EndingContractList } from "@/components/packages-report/EndingContractList";
import { PackagesPlanTable } from "@/components/packages-report/PackagesPlanTable";
import { PackagesReportCards } from "@/components/packages-report/PackagesReportCards";
import {
  PACKAGES_REPORT_PATH,
  packagesReportQuery,
  readPackagesReportFilters,
} from "@/components/packages-report/packages-report-filters";
import { PackagesReportToolbar } from "@/components/packages-report/PackagesReportToolbar";
import { PrintButton } from "@/components/shared/PrintButton";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getPackagesReport,
  listEndingContracts,
} from "@/services/packages-report.service";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;

/**
 * Relatório de pacotes (screens/relatorio-pacotes.md): renderizado no
 * servidor, com período e página pela URL.
 */
export async function PackagesReportPage({
  searchParams,
}: {
  /** ?de=, ?ate= e ?page=. */
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const filters = readPackagesReportFilters(searchParams);
  const query = packagesReportQuery(filters, month).toString();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [report, ending] = await Promise.all([
    getPackagesReport({
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    listEndingContracts({ page, limit: PAGE_SIZE }),
  ]);

  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Pacotes</h1>
          <p className="text-sm text-muted-foreground">
            Contratações novas, ativas e canceladas, e quem está para renovar.
          </p>
        </div>
        {/* A impressão leva o mesmo período e a lista inteira. */}
        <PrintButton
          href={`${PACKAGES_REPORT_PATH}/imprimir${query ? `?${query}` : ""}`}
        />
      </div>
      <PackagesReportToolbar filters={filters} month={month} />
      <PackagesReportCards report={report} />
      <PackagesPlanTable plans={report.byPlan} />
      {/* A lista mantém uma altura mínima e rola por dentro. */}
      <div className="flex min-h-[28rem] flex-1 flex-col">
        <EndingContractList
          contracts={ending.items}
          footer={
            <TablePagination
              page={page}
              limit={PAGE_SIZE}
              total={ending.total}
              basePath={PACKAGES_REPORT_PATH}
              query={Object.fromEntries(new URLSearchParams(query))}
            />
          }
        />
      </div>
    </div>
  );
}
