import { AppointmentPeakChart } from "@/components/appointment-report/AppointmentPeakChart";
import { AppointmentPeriodChart } from "@/components/appointment-report/AppointmentPeriodChart";
import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { KIND_LABELS } from "@/components/clients-report/clients-report-filters";
import { ShareList } from "@/components/clients-report/ShareList";
import {
  previousPeriod,
  readDashboardFilters,
} from "@/components/dashboard/dashboard-filters";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { PendingToday } from "@/components/dashboard/PendingToday";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { PaymentMethodDonut } from "@/components/dashboard/PaymentMethodDonut";
import { FinancialPeriodChart } from "@/components/financial-report/FinancialPeriodChart";
import { showsProducts } from "@/components/financial-report/financial-report-filters";
import { PackagesPlanTable } from "@/components/packages-report/PackagesPlanTable";
import { RankingTable } from "@/components/rankings/RankingTable";
import { ReceivablesAgingChart } from "@/components/receivables/ReceivablesAgingChart";
import { ApiError } from "@/services/api";
import { getAppointmentReport } from "@/services/appointment-report.service";
import { getCurrentUser } from "@/services/auth.service";
import { getClientsReport } from "@/services/clients-report.service";
import { getFinancialReport } from "@/services/financial-report.service";
import { getPackagesReport } from "@/services/packages-report.service";
import { getOnboarding } from "@/services/onboarding.service";
import { getPendingSummary } from "@/services/pending-summary.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { getRankings } from "@/services/rankings.service";
import { getReceivablesSummary } from "@/services/receivables.service";
import type { RankingRow } from "@/types/rankings";
import { canAccess } from "@/utils/access";
import { fetchAllPages } from "@/utils/fetch-all-pages";
import { formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

/** Quantos aparecem nos tops de serviços e profissionais. */
const TOP = 5;

// Busca só o que a empresa tem; sem a funcionalidade, o bloco some.
const when = <T,>(allowed: boolean, load: () => Promise<T>) =>
  allowed ? load() : Promise.resolve(null);

/**
 * Dashboard (screens/dashboard.md): os números dos relatórios numa tela só,
 * renderizada no servidor. Cada bloco chama a rota do relatório de origem,
 * então o número é sempre o mesmo do relatório.
 */
export async function DashboardPage({
  searchParams,
}: {
  /** ?de= e ?ate=. */
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), user.company.timezone));
  const filters = readDashboardFilters(searchParams);
  const period = {
    from: filters.from || month.from,
    to: filters.to || month.to,
  };
  const previous = previousPeriod(period.from, period.to);
  const prev = { from: previous.from, to: previous.to };
  const can = (feature: string) => canAccess(user.access, feature);

  const [
    financial,
    financialBefore,
    appointments,
    appointmentsBefore,
    clients,
    clientsBefore,
    receivables,
    rankings,
    packages,
    methods,
  ] = await Promise.all([
    when(can("financial-report"), () => getFinancialReport(period)),
    when(can("financial-report"), () => getFinancialReport(prev)),
    when(can("appointments-report"), () => getAppointmentReport(period)),
    when(can("appointments-report"), () => getAppointmentReport(prev)),
    when(can("clients-report"), () => getClientsReport(period)),
    when(can("clients-report"), () => getClientsReport(prev)),
    when(can("receivables"), () => getReceivablesSummary(period)),
    when(can("rankings"), () => getRankings({ ...period, sort: "amount" })),
    when(can("packages-report"), () => getPackagesReport(period)),
    // Ordem do cadastro (alfabética, com os inativos): dá a cor de cada método.
    when(can("financial-report"), () =>
      fetchAllPages((page, limit) => listPaymentMethods({ page, limit })),
    ),
  ]);

  const nothing =
    !financial &&
    !appointments &&
    !clients &&
    !receivables &&
    !rankings &&
    !packages;
  const topColumns = [
    { header: "Concluídos", cell: (row: RankingRow) => row.completed },
    { header: "Faturado", cell: (row: RankingRow) => formatPrice(row.amount) },
  ];

  // relative: os absolutos de dentro (sr-only, dicas dos gráficos) não
  // esticam a página além da rolagem própria.
  // As pendências do dia são um extra do topo: se a API falhar só nelas, o
  // Dashboard abre sem o bloco.
  const pending = await getPendingSummary().catch((error: unknown) => {
    if (error instanceof ApiError) return null;
    throw error;
  });

  // Os primeiros passos: outro extra do topo (a clínica nova).
  const onboarding = await getOnboarding().catch((error: unknown) => {
    if (error instanceof ApiError) return null;
    throw error;
  });

  return (
    <div className="relative -m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Os principais números da empresa no período, comparados com o{" "}
          {previous.label}.
        </p>
      </div>
      {onboarding && <OnboardingChecklist onboarding={onboarding} />}
      <DashboardToolbar filters={filters} month={month} />

      {nothing ? (
        <>
          <p className="rounded-card border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum relatório liberado para a empresa. Os blocos do Dashboard
            aparecem conforme os relatórios liberados em Acessos e limites.
          </p>
          {pending && <PendingToday summary={pending} />}
        </>
      ) : (
        <>
          <DashboardMetrics
            label={previous.label}
            financial={
              financial && financialBefore
                ? { current: financial, previous: financialBefore }
                : null
            }
            appointments={
              appointments && appointmentsBefore
                ? { current: appointments, previous: appointmentsBefore }
                : null
            }
            clients={
              clients && clientsBefore
                ? { current: clients, previous: clientsBefore }
                : null
            }
            receivables={receivables}
          />

          {/* Pendências de hoje: logo abaixo dos cards de números. */}
          {pending && <PendingToday summary={pending} />}

          {financial && (
            <DashboardSection title="Financeiro" href="/relatorios/financeiro">
              <FinancialPeriodChart
                series={financial.series}
                products={showsProducts(financial, can("product-sales"))}
              />
              <PaymentMethodDonut
                methods={financial.byMethod}
                total={financial.received.amount}
                order={(methods ?? []).map((method) => method.id)}
              />
            </DashboardSection>
          )}
          {appointments && (
            <DashboardSection
              title="Agendamentos"
              href="/relatorios/agendamentos"
            >
              <AppointmentPeriodChart series={appointments.series} />
              <AppointmentPeakChart peak={appointments.peak} />
            </DashboardSection>
          )}
          {rankings && (
            <DashboardSection title="Rankings" href="/relatorios/rankings">
              <RankingTable
                title={`Top ${TOP} serviços`}
                nameHeader="Serviço"
                rows={rankings.services.slice(0, TOP)}
                columns={topColumns}
                barValue={(row) => Number(row.amount)}
                emptyMessage="Nenhum atendimento concluído no período."
              />
              <RankingTable
                title={`Top ${TOP} profissionais`}
                nameHeader="Profissional"
                rows={rankings.professionals.slice(0, TOP)}
                columns={topColumns}
                barValue={(row) => Number(row.amount)}
                emptyMessage="Nenhum atendimento concluído no período."
              />
            </DashboardSection>
          )}
          {clients && (
            <DashboardSection
              title="Perfil do cliente"
              href="/relatorios/perfil-do-cliente"
            >
              <ShareList
                title="Tipo de atendimento"
                description="Dos clientes atendidos no período."
                emptyMessage="Nenhum atendimento concluído no período."
                rows={(
                  Object.keys(KIND_LABELS) as (keyof typeof KIND_LABELS)[]
                ).map((kind) => ({
                  label: KIND_LABELS[kind],
                  ...clients.kinds[kind],
                }))}
              />
              <ShareList
                title="Por onde agendam"
                description="Dos atendimentos concluídos no período."
                emptyMessage="Nenhum atendimento concluído no período."
                rows={[
                  { label: "Pela clínica", ...clients.sources.clinic },
                  { label: "Pelo app", ...clients.sources.portal },
                ]}
              />
            </DashboardSection>
          )}
          {/* Os dois de um bloco só ficam lado a lado em telas bem largas
              (antes disso, a tabela de pacotes não cabe na metade). */}
          {(receivables || packages) && (
            <div className="grid gap-4 2xl:grid-cols-2">
              {receivables && (
                <DashboardSection
                  title="Análise de recebíveis"
                  href="/relatorios/analise-de-recebiveis"
                >
                  <div className="xl:col-span-2">
                    <ReceivablesAgingChart aging={receivables.aging} />
                  </div>
                </DashboardSection>
              )}
              {packages && (
                <DashboardSection title="Pacotes" href="/relatorios/pacotes">
                  <div className="xl:col-span-2">
                    <PackagesPlanTable plans={packages.byPlan} />
                  </div>
                </DashboardSection>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
