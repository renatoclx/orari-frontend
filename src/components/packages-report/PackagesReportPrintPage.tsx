import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { endDay } from "@/components/packages-report/EndingContractList";
import { PackagesPlanTable } from "@/components/packages-report/PackagesPlanTable";
import { PackagesReportCards } from "@/components/packages-report/PackagesReportCards";
import {
  readPackagesReportFilters,
  sessionsText,
} from "@/components/packages-report/packages-report-filters";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintTable } from "@/components/shared/PrintTable";
import { getCurrentUser } from "@/services/auth.service";
import {
  getPackagesReport,
  listEndingContracts,
} from "@/services/packages-report.service";
import { fetchAllPages } from "@/utils/fetch-all-pages";
import { formatDateOnly, formatPhone } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/**
 * Relatório de pacotes para imprimir (screens/relatorio-pacotes.md): o mesmo
 * período da tela, com a lista inteira de quem está terminando.
 */
export async function PackagesReportPrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const filters = readPackagesReportFilters(searchParams);

  const [report, ending] = await Promise.all([
    getPackagesReport({
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    fetchAllPages((page, limit) => listEndingContracts({ page, limit })),
  ]);

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Pacotes"
        companyName={company.name}
        timeZone={company.timezone}
        details={[
          `Período (novas e canceladas): ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
        ]}
      />
      <PackagesReportCards report={report} />
      <PackagesPlanTable plans={report.byPlan} />
      <section className="space-y-2 print:break-inside-avoid">
        <h2 className="font-semibold">Terminando em 30 dias</h2>
        <PrintTable
          columns={[
            "Cliente",
            "Celular",
            "Pacote",
            "Termina em",
            "Sessões concluídas",
          ]}
          emptyMessage="Nenhuma contratação terminando nos próximos 30 dias sem renovação."
          rows={ending.map((contract) => [
            contract.client.name,
            contract.client.phone ? formatPhone(contract.client.phone) : "--",
            contract.plan.name,
            endDay(contract.endDate),
            sessionsText(contract.sessions),
          ])}
        />
      </section>
    </>
  );
}
