import { dayMonth, fullDate } from "@/components/clients-report/BirthdayList";
import { ClientsReportCards } from "@/components/clients-report/ClientsReportCards";
import { ClientsReportDistributions } from "@/components/clients-report/ClientsReportDistributions";
import { readClientsReportFilters } from "@/components/clients-report/clients-report-filters";
import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintTable } from "@/components/shared/PrintTable";
import { getCurrentUser } from "@/services/auth.service";
import {
  getClientsReport,
  listBirthdays,
} from "@/services/clients-report.service";
import { fetchAllPages } from "@/utils/fetch-all-pages";
import { formatDateOnly, formatPhone } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/**
 * Perfil do cliente para imprimir (screens/relatorio-perfil-cliente.md): o
 * mesmo período da tela, com todos os aniversariantes.
 */
export async function ClientsReportPrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const filters = readClientsReportFilters(searchParams);
  const period = {
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const [report, birthdays] = await Promise.all([
    getClientsReport(period),
    fetchAllPages((page, limit) => listBirthdays({ ...period, page, limit })),
  ]);

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Perfil do cliente"
        companyName={company.name}
        timeZone={company.timezone}
        details={[
          `Período: ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
        ]}
      />
      <ClientsReportCards report={report} />
      <ClientsReportDistributions report={report} />
      {/* Sem quebra forçada: a lista segue as distribuições na segunda folha. */}
      <section className="space-y-2">
        <h2 className="font-semibold">Aniversariantes do período</h2>
        <PrintTable
          columns={[
            "Cliente",
            "Celular",
            "Aniversário",
            "Completa",
            "Nascimento",
          ]}
          emptyMessage="Nenhum aniversariante no período entre os clientes com data de nascimento."
          rows={birthdays.map((client) => [
            client.name,
            client.phone ? formatPhone(client.phone) : "--",
            dayMonth(client.birthday),
            `${client.turning} anos`,
            fullDate(client.birthDate),
          ])}
        />
      </section>
    </>
  );
}
