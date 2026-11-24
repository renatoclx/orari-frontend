import {
  RankingTable,
  type RankingColumn,
} from "@/components/rankings/RankingTable";
import type { RankingRow, RankingSort, Rankings } from "@/types/rankings";
import { formatDateOnly, formatPercent, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

const money = (value: string | null) => (value ? formatPrice(value) : "--");

type RankingsTablesProps = {
  rankings: Rankings;
  sort: RankingSort;
  timeZone: string;
  /** Quantos de cada ranking; sem limite, todos (impressão). */
  limit?: number;
};

/** Os três rankings (screens/rankings.md), na ordem escolhida. */
export function RankingsTables({
  rankings,
  sort,
  timeZone,
  limit,
}: RankingsTablesProps) {
  const take = <T,>(rows: T[]) => (limit ? rows.slice(0, limit) : rows);
  // A barra acompanha a ordem: faturado ou quantidade.
  const barValue = (row: RankingRow) =>
    sort === "count" ? row.completed : Number(row.amount);
  const base: RankingColumn<RankingRow>[] = [
    { header: "Concluídos", cell: (row) => row.completed },
    { header: "Faturado", cell: (row) => formatPrice(row.amount) },
    { header: "Ticket médio", cell: (row) => money(row.average) },
  ];
  const empty = "Nenhum atendimento concluído no período.";

  return (
    <>
      <RankingTable
        title="Serviços"
        nameHeader="Serviço"
        rows={take(rankings.services)}
        columns={[
          ...base,
          { header: "% do faturado", cell: (row) => formatPercent(row.share) },
        ]}
        barValue={barValue}
        emptyMessage={empty}
      />
      <RankingTable
        title="Profissionais"
        nameHeader="Profissional"
        rows={take(rankings.professionals)}
        columns={[...base, { header: "Clientes", cell: (row) => row.clients }]}
        barValue={barValue}
        emptyMessage={empty}
      />
      <RankingTable
        title="Clientes"
        nameHeader="Cliente"
        rows={take(rankings.clients)}
        columns={[
          { header: "Visitas", cell: (row) => row.completed },
          { header: "Faturado", cell: (row) => formatPrice(row.amount) },
          {
            header: "Em pacotes",
            cell: (row) =>
              Number(row.packages) > 0 ? formatPrice(row.packages) : "--",
          },
          {
            header: "Última visita",
            cell: (row) =>
              row.lastVisit
                ? formatDateOnly(
                    `${toDateString(new Date(row.lastVisit), timeZone)}T00:00:00Z`,
                  )
                : "--",
          },
        ]}
        barValue={barValue}
        emptyMessage="Nenhum cliente com atendimento ou pacote no período."
      />
    </>
  );
}
