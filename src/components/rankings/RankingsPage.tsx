import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import {
  RANKINGS_PATH,
  SCREEN_LIMIT,
  rankingsQuery,
  readRankingsFilters,
} from "@/components/rankings/rankings-filters";
import { RankingsCards } from "@/components/rankings/RankingsCards";
import { RankingsTables } from "@/components/rankings/RankingsTables";
import { RankingsToolbar } from "@/components/rankings/RankingsToolbar";
import { PrintButton } from "@/components/shared/PrintButton";
import { getCurrentUser } from "@/services/auth.service";
import { getRankings } from "@/services/rankings.service";
import { toDateString } from "@/utils/time";

/**
 * Rankings (screens/rankings.md): renderizado no servidor, com período e
 * ordem pela URL. A tela mostra os 10 primeiros de cada; a impressão, todos.
 */
export async function RankingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const { filters, sort } = readRankingsFilters(searchParams);
  const query = rankingsQuery(filters, month).toString();
  const rankings = await getRankings({
    from: filters.from || undefined,
    to: filters.to || undefined,
    sort,
  });

  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Rankings</h1>
          <p className="text-sm text-muted-foreground">
            Os serviços, profissionais e clientes que mais movimentaram o
            período (os {SCREEN_LIMIT} primeiros; a impressão traz todos).
          </p>
        </div>
        <PrintButton
          href={`${RANKINGS_PATH}/imprimir${query ? `?${query}` : ""}`}
        />
      </div>
      <RankingsToolbar filters={filters} month={month} />
      <RankingsCards summary={rankings.summary} />
      <div className="grid gap-3">
        <RankingsTables
          rankings={rankings}
          sort={sort}
          timeZone={company.timezone}
          limit={SCREEN_LIMIT}
        />
      </div>
    </div>
  );
}
