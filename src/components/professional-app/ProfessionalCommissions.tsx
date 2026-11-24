import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  HandCoins,
  Info,
} from "lucide-react";
import {
  listProfessionalCommissions,
  getProfessionalCommissionSummary,
} from "@/services/app-pro.service";
import { formatPrice } from "@/utils/format";
import { AppPagination } from "./AppPagination";
import { CommissionCard } from "./CommissionCard";
import { requireCommissions } from "./commissions-gate";
import {
  currentMonth,
  monthLabel,
  shiftMonth,
} from "./professional-commissions";
import { pageCount } from "./professional-clients";

const NAV_BUTTON =
  "flex size-10 shrink-0 items-center justify-center rounded-control border border-border bg-card text-muted-foreground hover:text-foreground";

/**
 * Aba Comissões do profissional (screens/app-profissional.md): o mês (a
 * comissão pela data do atendimento), o que está em aberto (adiantado e a
 * receber, de todos os meses) e a lista do mês. Só consulta; sem o que o
 * cliente pagou.
 */
export async function ProfessionalCommissions({
  month,
  page,
}: {
  month?: string;
  page: number;
}) {
  const me = await requireCommissions();
  const summary = await getProfessionalCommissionSummary(month);
  const current = currentMonth(me.company.timezone);
  const list = summary.receivesCommission
    ? await listProfessionalCommissions(summary.month, page)
    : null;
  const href = (target: string, targetPage = 1) => {
    const params = new URLSearchParams();
    if (target !== current) params.set("mes", target);
    if (targetPage > 1) params.set("pagina", String(targetPage));
    const query = params.toString();
    return query ? `/app/comissoes?${query}` : "/app/comissoes";
  };

  return (
    <>
      <header className="flex items-center gap-2">
        <Link
          href={href(shiftMonth(summary.month, -1))}
          aria-label="Mês anterior"
          className={NAV_BUTTON}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="text-lg font-semibold">Comissões</h1>
          <p className="truncate text-sm text-muted-foreground">
            {monthLabel(summary.month)}
          </p>
        </div>
        {summary.month < current ? (
          <Link
            href={href(shiftMonth(summary.month, 1))}
            aria-label="Próximo mês"
            className={NAV_BUTTON}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </Link>
        ) : (
          <span className={`${NAV_BUTTON} opacity-40`} aria-hidden="true">
            <ChevronRight className="size-5" />
          </span>
        )}
      </header>

      {!summary.receivesCommission ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Info className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold">Você não recebe comissão</p>
          <p className="text-sm text-muted-foreground">
            A clínica não registra comissão para o seu cadastro. Em caso de
            dúvida, fale com ela.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-1 rounded-card border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Comissão do mês</p>
            <p className="text-3xl font-semibold">
              {formatPrice(summary.amount)}
            </p>
            <p className="text-sm text-muted-foreground">
              {summary.count === 1
                ? "1 atendimento"
                : `${summary.count} atendimentos`}
            </p>
          </section>

          <section aria-label="Em aberto" className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 rounded-card border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Adiantado</p>
                <p className="text-lg font-semibold">
                  {formatPrice(summary.advanced)}
                </p>
              </div>
              <div className="space-y-1 rounded-card border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">A receber</p>
                <p className="text-lg font-semibold">
                  {formatPrice(summary.toPay)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Adiantado e a receber somam o que ainda não foi fechado, de todos
              os meses.
            </p>
          </section>

          <Link
            href="/app/comissoes/fechamentos"
            className="flex h-12 items-center justify-center gap-2 rounded-control border border-border bg-card text-sm font-medium"
          >
            <FileText className="size-4" aria-hidden="true" />
            Fechamentos
          </Link>

          {list && list.items.length > 0 ? (
            <>
              <ul className="space-y-2">
                {list.items.map((item) => (
                  <CommissionCard
                    key={item.id}
                    item={item}
                    timeZone={me.company.timezone}
                  />
                ))}
              </ul>
              <AppPagination
                page={page}
                pages={pageCount(list.total, list.limit)}
                href={(target) => href(summary.month, target)}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <HandCoins
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-semibold">Nenhuma comissão neste mês</p>
              <p className="text-sm text-muted-foreground">
                Elas aparecem aqui quando os atendimentos são concluídos.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
