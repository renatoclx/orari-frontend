import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { ReceivablesAgingChart } from "@/components/receivables/ReceivablesAgingChart";
import { readReceivablesFilters } from "@/components/receivables/receivables-filters";
import { ReceivablesMonthsChart } from "@/components/receivables/ReceivablesMonthsChart";
import { ReceivablesSummaryCards } from "@/components/receivables/ReceivablesSummaryCards";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintTable } from "@/components/shared/PrintTable";
import { getCurrentUser } from "@/services/auth.service";
import {
  getReceivablesSummary,
  listReceivablesDebtors,
} from "@/services/receivables.service";
import { fetchAllPages } from "@/utils/fetch-all-pages";
import { formatDateOnly, formatPhone, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/**
 * Análise de recebíveis para imprimir (screens/analise-de-recebiveis.md): os mesmos
 * filtros da tela, com a lista inteira dos clientes com atraso.
 */
export async function ReceivablesPrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { company } = await getCurrentUser();
  const month = monthOf(toDateString(new Date(), company.timezone));
  const filters = readReceivablesFilters(searchParams);

  const [summary, debtors] = await Promise.all([
    getReceivablesSummary({
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    fetchAllPages((page, limit) =>
      listReceivablesDebtors({ search: filters.search, page, limit }),
    ),
  ]);

  const details = [
    `Período (recebido e inadimplência): ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
    ...(filters.search ? [`Busca: ${filters.search}`] : []),
  ];

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Análise de recebíveis"
        companyName={company.name}
        timeZone={company.timezone}
        details={details}
      />
      <ReceivablesSummaryCards summary={summary} />
      <div className="grid gap-3 print:break-inside-avoid">
        <ReceivablesAgingChart aging={summary.aging} />
        <ReceivablesMonthsChart months={summary.months} print />
      </div>
      <section className="space-y-2 print:break-before-page">
        <h2 className="font-semibold">Clientes com atraso</h2>
        <PrintTable
          columns={[
            "Cliente",
            "Celular",
            "Em atraso",
            "Pagamentos",
            "Vencimento mais antigo",
          ]}
          emptyMessage="Nenhum cliente com pagamento atrasado."
          rows={debtors.map((debtor) => [
            debtor.name,
            debtor.phone ? formatPhone(debtor.phone) : "--",
            formatPrice(debtor.overdue),
            debtor.count,
            day(debtor.oldestDueDate),
          ])}
        />
      </section>
    </>
  );
}
