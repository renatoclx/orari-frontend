import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { CommissionList } from "@/components/commissions/CommissionList";
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
  /** ?profissional=, ?de=, ?ate= e ?page=. */
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

  const [summary, list] = await Promise.all([
    getCommissionSummary(params),
    professionalId
      ? listCommissions({ ...params, page, limit: PAGE_SIZE })
      : Promise.resolve(null),
  ]);

  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Comissões</h1>
        <p className="text-sm text-muted-foreground">
          A comissão de cada profissional pelos atendimentos concluídos e quanto
          os clientes já pagaram.
        </p>
      </div>
      <CommissionsToolbar
        filters={filters}
        month={month}
        professionals={options}
      />
      <CommissionsCards summary={summary} />
      <div className="flex min-h-[28rem] flex-1 flex-col">
        {list ? (
          <CommissionList
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
