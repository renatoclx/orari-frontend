import { RankingTable } from "@/components/rankings/RankingTable";
import type { PackagesByPlan } from "@/types/packages-report";
import { formatPrice } from "@/utils/format";

/**
 * Contratações por pacote, do maior valor contratado para o menor. Reaproveita
 * a tabela dos Rankings: posição, barra proporcional e os números ao lado.
 */
export function PackagesPlanTable({ plans }: { plans: PackagesByPlan[] }) {
  return (
    <RankingTable
      title="Por pacote"
      nameHeader="Pacote"
      rows={plans}
      barValue={(row) => Number(row.amount)}
      emptyMessage="Nenhuma contratação no período nem ativa hoje."
      columns={[
        { header: "Novas", cell: (row) => row.created },
        { header: "Valor contratado", cell: (row) => formatPrice(row.amount) },
        { header: "Ativas hoje", cell: (row) => row.active },
        { header: "Canceladas", cell: (row) => row.cancelled },
      ]}
    />
  );
}
