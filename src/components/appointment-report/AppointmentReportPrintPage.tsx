import { AppointmentBreakdownTable } from "@/components/appointment-report/AppointmentBreakdownTable";
import { AppointmentPeakChart } from "@/components/appointment-report/AppointmentPeakChart";
import { AppointmentPeriodChart } from "@/components/appointment-report/AppointmentPeriodChart";
import { AppointmentReportCards } from "@/components/appointment-report/AppointmentReportCards";
import {
  ALL_PROFESSIONALS,
  readAppointmentReportFilters,
} from "@/components/appointment-report/appointment-report-filters";
import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { getAppointmentReport } from "@/services/appointment-report.service";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { MAX_PAGE_SIZE } from "@/utils/fetch-all-pages";
import { formatDateOnly } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/** Relatório de agendamentos para imprimir: os mesmos filtros da tela. */
export async function AppointmentReportPrintPage({
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
  const filters = readAppointmentReportFilters(
    searchParams,
    professionals.items.map((item) => item.id),
  );
  const professional = professionals.items.find(
    (item) => item.id === filters.professional,
  );

  const report = await getAppointmentReport({
    professionalId:
      filters.professional === ALL_PROFESSIONALS
        ? undefined
        : filters.professional,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Agendamentos"
        companyName={company.name}
        timeZone={company.timezone}
        details={[
          `Profissional: ${professional?.name ?? "Todos"}`,
          `Período: ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
        ]}
      />
      <AppointmentReportCards report={report} />
      <div className="grid gap-3">
        <AppointmentPeriodChart series={report.series} print />
        <AppointmentPeakChart peak={report.peak} />
      </div>
      <div className="grid gap-3 print:break-before-page">
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
    </>
  );
}
