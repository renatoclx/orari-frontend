import Link from "next/link";
import {
  CalendarClock,
  Hourglass,
  MoonStar,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  dueText,
  lastActivityText,
} from "@/components/platform-dashboard/platform-format";
import type { PlatformDashboard } from "@/types/platform-dashboard";
import { formatDateOnly } from "@/utils/format";

type Row = { companyId: string; companyName: string; hint: string };

/** Quantos aparecem em cada lista; o resto vira "+ N". */
const LIMIT = 5;

function AttentionList({
  icon: Icon,
  title,
  description,
  rows,
  empty,
  alert = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  rows: Row[];
  empty: string;
  alert?: boolean;
}) {
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            alert && rows.length > 0
              ? "bg-destructive/10 text-destructive dark:text-red-400"
              : "bg-muted text-foreground"
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            {title}
            <span className="rounded-full bg-muted px-2 text-xs font-medium tabular-nums">
              {rows.length}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {rows.slice(0, LIMIT).map((row) => (
            <li key={row.companyId}>
              {/* A linha leva à assinatura da empresa, onde se resolve. */}
              <Link
                href={`/assinaturas/${row.companyId}`}
                // No celular, nome e prazo empilham: o nome não é cortado.
                className="-mx-2 flex justify-between gap-x-3 gap-y-0.5 rounded-control px-2 py-2 hover:bg-muted max-sm:flex-col sm:items-center"
              >
                <span className="font-medium sm:truncate">
                  {row.companyName}
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {row.hint}
                </span>
              </Link>
            </li>
          ))}
          {rows.length > LIMIT && (
            <li className="pt-2 text-muted-foreground">
              + {rows.length - LIMIT} em Assinaturas
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

/**
 * "Precisa de atenção": o que pede uma ação do SUPER_ADMIN hoje, em quatro
 * listas curtas, cada linha um atalho para a assinatura da empresa.
 */
export function AttentionPanel({
  data,
  today,
}: {
  data: PlatformDashboard;
  /** Hoje da plataforma ("aaaa-mm-dd"). */
  today: string;
}) {
  const { trialsEnding, overdue, renewals, idle } = data.attention;
  const dated = (items: typeof trialsEnding, prefix: string): Row[] =>
    items.map((item) => ({
      companyId: item.companyId,
      companyName: item.companyName,
      hint: `${prefix} ${formatDateOnly(item.date)} (${dueText(item.date, today)})`,
    }));

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <AttentionList
        icon={Hourglass}
        title="Testes acabando"
        description="Terminam nos próximos 7 dias: hora de conversar."
        rows={dated(trialsEnding, "até")}
        empty="Nenhum teste termina nesta semana."
      />
      <AttentionList
        icon={TriangleAlert}
        title="Pagamentos vencidos"
        description="Na tolerância de 5 dias; depois, somente leitura."
        rows={dated(overdue, "bloqueia após")}
        empty="Nenhum pagamento vencido."
        alert
      />
      <AttentionList
        icon={CalendarClock}
        title="Renovações chegando"
        description="Vencem nos próximos 14 dias."
        rows={dated(renewals, "vence")}
        empty="Nenhum vencimento nas próximas duas semanas."
      />
      <AttentionList
        icon={MoonStar}
        title="Empresas paradas"
        description="Sem agendamento criado há 14 dias: risco de cancelar."
        rows={idle.map((item) => ({
          companyId: item.companyId,
          companyName: item.companyName,
          hint: `último: ${lastActivityText(item.lastActivityAt)}`,
        }))}
        empty="Todas criaram agendamentos nas últimas duas semanas."
      />
    </div>
  );
}
