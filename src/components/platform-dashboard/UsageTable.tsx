import Link from "next/link";
import { lastActivityText } from "@/components/platform-dashboard/platform-format";
import { SubscriptionStatusBadge } from "@/components/subscriptions/SubscriptionStatusBadge";
import { planLabel } from "@/components/subscriptions/subscription-catalog";
import type { PlatformDashboard } from "@/types/platform-dashboard";

type UsageRow = PlatformDashboard["usage"][number];

const status = (row: UsageRow) => (row.status === "NONE" ? null : row.status);

/**
 * Uso por empresa: quem usa de verdade. Os agendamentos dos últimos 30 dias
 * ganham uma barra fina (proporcional ao maior), para comparar de relance.
 */
export function UsageTable({ data }: { data: PlatformDashboard }) {
  const largest = Math.max(...data.usage.map((row) => row.appointments30d), 1);

  const bar = (row: UsageRow) => (
    <span className="flex items-center gap-2">
      <span className="w-8 text-right tabular-nums">{row.appointments30d}</span>
      <span className="h-1.5 w-24 rounded-full bg-muted" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-chart-info"
          style={{ width: `${(row.appointments30d / largest) * 100}%` }}
        />
      </span>
    </span>
  );

  return (
    <section
      aria-labelledby="usage-title"
      className="flex min-w-0 flex-col rounded-card border border-border bg-card"
    >
      <div className="p-4 pb-3">
        <h2 id="usage-title" className="font-semibold">
          Uso por empresa
        </h2>
        <p className="text-sm text-muted-foreground">
          Agendamentos criados nos últimos 30 dias, cadastros ativos e a última
          atividade.
        </p>
      </div>

      {data.usage.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma empresa ativa.
        </p>
      ) : (
        <>
          {/* Celular: cartões. */}
          <ul className="divide-y divide-border border-t border-border md:hidden">
            {data.usage.map((row) => (
              <li key={row.companyId} className="space-y-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/assinaturas/${row.companyId}`}
                    className="font-medium hover:underline"
                  >
                    {row.companyName}
                  </Link>
                  <SubscriptionStatusBadge status={status(row)} />
                </div>
                {bar(row)}
                <p className="text-muted-foreground">
                  {row.clients} clientes · {row.professionals} profissionais ·
                  último: {lastActivityText(row.lastActivityAt)}
                </p>
              </li>
            ))}
          </ul>

          <table className="hidden w-full text-left text-sm md:table">
            <thead>
              <tr className="border-y border-border text-muted-foreground">
                {[
                  "Empresa",
                  "Situação",
                  "Plano",
                  "Agendamentos (30 dias)",
                  "Clientes",
                  "Profissionais",
                  "Última atividade",
                ].map((title) => (
                  <th key={title} scope="col" className="px-4 py-3 font-medium">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.usage.map((row) => (
                <tr key={row.companyId} className="hover:bg-background">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/assinaturas/${row.companyId}`}
                      className="hover:underline"
                    >
                      {row.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionStatusBadge status={status(row)} />
                  </td>
                  <td className="px-4 py-3">
                    {row.plan ? (
                      planLabel(row.plan)
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{bar(row)}</td>
                  <td className="px-4 py-3 tabular-nums">{row.clients}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.professionals}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lastActivityText(row.lastActivityAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
