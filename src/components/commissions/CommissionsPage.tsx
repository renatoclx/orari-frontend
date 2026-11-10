import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { AdvanceList } from "@/components/commissions/AdvanceList";
import { CommissionList } from "@/components/commissions/CommissionList";
import { CommissionTabs } from "@/components/commissions/CommissionTabs";
import { LaunchAdvanceButton } from "@/components/commissions/LaunchAdvanceButton";
import { CommissionProfessionalList } from "@/components/commissions/CommissionProfessionalList";
import { CommissionsCards } from "@/components/commissions/CommissionsCards";
import {
  ALL_PROFESSIONALS,
  COMMISSIONS_PATH,
  commissionsQuery,
  readCommissionFilters,
} from "@/components/commissions/commission-filters";
import { CommissionsToolbar } from "@/components/commissions/CommissionsToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { getCurrentUser } from "@/services/auth.service";
import {
  getCommissionSummary,
  listCommissionAdvances,
  listCommissions,
} from "@/services/commission.service";
import { listPeople } from "@/services/people.service";
import { MAX_PAGE_SIZE } from "@/utils/fetch-all-pages";
import { toDateString } from "@/utils/time";

const PAGE_SIZE = 10;

/**
 * Comissões (screens/comissoes.md): sem profissional, os totais por
 * profissional; com ele, os atendimentos um a um. Tudo pela URL.
 */
export async function CommissionsPage({
  searchParams,
}: {
  /** ?profissional=, ?de=, ?ate=, ?aba= e ?page=. */
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
  const today = toDateString(new Date(), company.timezone);
  const month = monthOf(today);
  const options = professionals.items.map(({ id, name }) => ({ id, name }));
  const filters = readCommissionFilters(
    searchParams,
    options.map((option) => option.id),
  );
  const query = commissionsQuery(filters, month).toString();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const professionalId =
    filters.professional === ALL_PROFESSIONALS
      ? undefined
      : filters.professional;
  const params = {
    from: filters.from || undefined,
    to: filters.to || undefined,
    professionalId,
  };

  // Aba do quadro do profissional; a de adiantamentos não depende do período.
  const tab =
    searchParams.aba === "adiantamentos" ? "adiantamentos" : "atendimentos";

  const [summary, list, advances] = await Promise.all([
    getCommissionSummary(params),
    professionalId
      ? listCommissions({ ...params, page, limit: PAGE_SIZE })
      : Promise.resolve(null),
    professionalId
      ? listCommissionAdvances(professionalId)
      : Promise.resolve(null),
  ]);
  const professionalName =
    options.find((option) => option.id === professionalId)?.name ?? "";

  // Mantém filtros e período; a página volta à primeira ao trocar de aba.
  const tabHref = (key: "atendimentos" | "adiantamentos") => {
    const next = new URLSearchParams(query);
    if (key === "adiantamentos") next.set("aba", key);
    return `${COMMISSIONS_PATH}?${next}`;
  };
  const tabs = list && advances && (
    <CommissionTabs
      active={tab}
      hrefFor={tabHref}
      counts={{ atendimentos: list.total, adiantamentos: advances.length }}
    />
  );

  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Comissões</h1>
          <p className="text-sm text-muted-foreground">
            A comissão de cada profissional pelos atendimentos concluídos, o que
            já foi adiantado e o que falta pagar.
          </p>
        </div>
        <LaunchAdvanceButton
          professionals={options}
          defaultProfessionalId={professionalId}
          today={today}
        />
      </div>
      <CommissionsToolbar
        filters={filters}
        month={month}
        professionals={options}
      />
      <CommissionsCards summary={summary} />
      <div className="flex min-h-[28rem] flex-1 flex-col">
        {advances && tab === "adiantamentos" ? (
          <AdvanceList
            advances={advances}
            professionalName={professionalName}
            tabs={tabs}
          />
        ) : list ? (
          <CommissionList
            tabs={tabs}
            items={list.items}
            timeZone={company.timezone}
            footer={
              <TablePagination
                page={page}
                limit={PAGE_SIZE}
                total={list.total}
                basePath={COMMISSIONS_PATH}
                query={Object.fromEntries(new URLSearchParams(query))}
              />
            }
          />
        ) : (
          <CommissionProfessionalList
            rows={summary.byProfessional}
            hrefFor={(id) =>
              `${COMMISSIONS_PATH}?${commissionsQuery(filters, month, { professional: id })}`
            }
          />
        )}
      </div>
    </div>
  );
}
