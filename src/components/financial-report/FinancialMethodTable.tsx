import { NO_METHOD_LABEL } from "@/components/financial-report/financial-report-filters";
import { RankingTable } from "@/components/rankings/RankingTable";
import type { FinancialReportMethod } from "@/types/financial-report";
import { formatPercent, formatPrice } from "@/utils/format";

/**
 * Recebido por método de pagamento, do maior para o menor. Reaproveita a
 * tabela dos Rankings: posição, barra proporcional e os números ao lado.
 */
export function FinancialMethodTable({
  methods,
}: {
  methods: FinancialReportMethod[];
}) {
  // O pagamento sem método vira uma linha própria, com id e nome de exibição.
  const rows = methods.map((method) => ({
    ...method,
    id: method.id ?? "sem-metodo",
    name: method.name ?? NO_METHOD_LABEL,
  }));

  return (
    <RankingTable
      title="Por método de pagamento"
      nameHeader="Método"
      rows={rows}
      barValue={(row) => Number(row.amount)}
      emptyMessage="Nenhum pagamento recebido no período."
      columns={[
        { header: "Pagamentos", cell: (row) => row.count },
        { header: "Recebido", cell: (row) => formatPrice(row.amount) },
        { header: "% do recebido", cell: (row) => formatPercent(row.share) },
      ]}
    />
  );
}
