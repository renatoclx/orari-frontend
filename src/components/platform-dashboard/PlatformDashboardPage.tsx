import { notFound } from "next/navigation";
import { AttentionPanel } from "@/components/platform-dashboard/AttentionPanel";
import { MonthlyBarsChart } from "@/components/platform-dashboard/MonthlyBarsChart";
import { PlatformKpis } from "@/components/platform-dashboard/PlatformKpis";
import { RevenueByPlan } from "@/components/platform-dashboard/RevenueByPlan";
import { StatusBreakdown } from "@/components/platform-dashboard/StatusBreakdown";
import { UsageTable } from "@/components/platform-dashboard/UsageTable";
import { getCurrentUser } from "@/services/auth.service";
import { getPlatformDashboard } from "@/services/platform-dashboard.service";

/** Fuso das contas da plataforma (o mesmo da API). */
const PLATFORM_TIME_ZONE = "America/Sao_Paulo";

// Título de um grupo do Painel, como no Dashboard da empresa.
function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Painel da plataforma (screens/painel.md), só do SUPER_ADMIN: receita,
 * crescimento, situação das empresas, o que precisa de atenção e o uso. Tudo
 * vem de uma rota (GET /platform/dashboard), renderizado no servidor.
 */
export async function PlatformDashboardPage() {
  const user = await getCurrentUser();
  if (user.type !== "SUPER_ADMIN") notFound();

  const data = await getPlatformDashboard();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: PLATFORM_TIME_ZONE,
  }).format(new Date());

  return (
    // A página rola por inteiro (como o Dashboard): são vários blocos.
    <div className="relative -m-1 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-1">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <p className="text-sm text-muted-foreground">
          Como vai o Orari: receita, crescimento, empresas e uso.
        </p>
      </div>

      <PlatformKpis data={data} />

      <Group title="Precisa de atenção">
        <AttentionPanel data={data} today={today} />
      </Group>

      <Group title="Receita e empresas">
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="xl:col-span-2">
            <MonthlyBarsChart
              id="received-month"
              title="Dinheiro recebido"
              description="O que entrou em cada mês."
              points={data.receivedByMonth.map((point) => ({
                month: point.month,
                count: point.amount,
              }))}
              color="var(--chart-positive)"
              unit="money"
            />
          </div>
          <RevenueByPlan data={data} />
          <StatusBreakdown data={data} />
        </div>
      </Group>

      <Group title="Crescimento">
        <div className="grid gap-3 xl:grid-cols-2">
          <MonthlyBarsChart
            id="companies-month"
            title="Novas empresas"
            description="Cadastradas por mês."
            points={data.companiesByMonth}
            color="var(--chart-info)"
            unit={["empresa nova", "empresas novas"]}
          />
          <MonthlyBarsChart
            id="appointments-month"
            title="Agendamentos na plataforma"
            description="Criados por mês, somando todas as empresas."
            points={data.appointmentsByMonth}
            color="var(--chart-positive)"
            unit={["agendamento", "agendamentos"]}
          />
        </div>
      </Group>

      <Group title="Uso">
        <UsageTable data={data} />
      </Group>
    </div>
  );
}
