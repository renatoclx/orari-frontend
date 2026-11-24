import { AppointmentBreakdownTable } from "@/components/appointment-report/AppointmentBreakdownTable";
import { AppointmentPeakChart } from "@/components/appointment-report/AppointmentPeakChart";
import { AppointmentPeriodChart } from "@/components/appointment-report/AppointmentPeriodChart";
import { AppointmentReportCards } from "@/components/appointment-report/AppointmentReportCards";
import {
  ALL_PROFESSIONALS,
  APPOINTMENT_REPORT_PATH,
  appointmentReportQuery,
  readAppointmentReportFilters,
} from "@/components/appointment-report/appointment-report-filters";
import { AppointmentReportToolbar } from "@/components/appointment-report/AppointmentReportToolbar";
import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { PrintButton } from "@/components/shared/PrintButton";
import { getAppointmentReport } from "@/services/appointment-report.service";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { MAX_PAGE_SIZE } from "@/utils/fetch-all-pages";
import { toDateString } from "@/utils/time";

/**
 * Relatório de agendamentos (screens/relatorio-agendamentos.md): renderizado
 * no servidor, com profissional e período pela URL.
 */
export async function AppointmentReportPage({
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
  const month = monthOf(toDateString(new Date(), company.timezone));
  const options = professionals.items.map(({ id, name }) => ({ id, name }));
  const filters = readAppointmentReportFilters(
    searchParams,
    options.map((option) => option.id),
  );
  const query = appointmentReportQuery(filters, month).toString();

  const report = await getAppointmentReport({
    professionalId:
      filters.professional === ALL_PROFESSIONALS
        ? undefined
        : filters.professional,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  // relative: os absolutos de dentro (sr-only, dicas dos gráficos) não
  // esticam a página além da rolagem própria.
  return (
    <div className="relative -m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">
            Quanto foi agendado, concluído, faltado e cancelado, e os horários
            mais procurados.
          </p>
        </div>
        <PrintButton
          href={`${APPOINTMENT_REPORT_PATH}/imprimir${query ? `?${query}` : ""}`}
        />
      </div>
      <AppointmentReportToolbar
        filters={filters}
        month={month}
        professionals={options}
      />
      <AppointmentReportCards report={report} />
      <div className="grid gap-3 lg:grid-cols-2">
        <AppointmentPeriodChart series={report.series} />
        <AppointmentPeakChart peak={report.peak} />
      </div>
      {/* Uma embaixo da outra: lado a lado, as colunas não cabem. */}
      <div className="grid gap-3">
        <AppointmentBreakdownTable
          title="Por profissional"
          nameHeader="Profissional"
          rows={report.byProfessional}
        />
        <AppointmentBreakdownTable
          title="Por serviço"
          nameHeader="Serviço"
          rows={report.byService}
        />
      </div>
    </div>
  );
}
