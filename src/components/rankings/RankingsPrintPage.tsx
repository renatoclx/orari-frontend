import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import {
  RANKING_SORTS,
  readRankingsFilters,
} from "@/components/rankings/rankings-filters";
import { RankingsCards } from "@/components/rankings/RankingsCards";
import { RankingsTables } from "@/components/rankings/RankingsTables";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { getCurrentUser } from "@/services/auth.service";
import { getRankings } from "@/services/rankings.service";
import { formatDateOnly } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/** Rankings para imprimir: os mesmos filtros da tela, com as listas inteiras. */
export async function RankingsPrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const { filters, sort } = readRankingsFilters(searchParams);
  const rankings = await getRankings({
    from: filters.from || undefined,
    to: filters.to || undefined,
    sort,
  });
  const sortLabel = RANKING_SORTS.find(
    (item) => item.id === filters.sort,
  )!.label.replace("Ordenar por ", "");

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Rankings"
        companyName={company.name}
        timeZone={company.timezone}
        details={[
          `Período: ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
          `Ordem: ${sortLabel}`,
        ]}
      />
      <RankingsCards summary={rankings.summary} />
      <div className="grid gap-3">
        <RankingsTables
          rankings={rankings}
          sort={sort}
          timeZone={company.timezone}
        />
      </div>
    </>
  );
}
