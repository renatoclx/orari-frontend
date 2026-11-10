import { monthOf } from "@/components/client-portfolio/portfolio-filters";
import { FinancialMethodTable } from "@/components/financial-report/FinancialMethodTable";
import { FinancialPeriodChart } from "@/components/financial-report/FinancialPeriodChart";
import { FinancialReportCards } from "@/components/financial-report/FinancialReportCards";
import {
  NO_METHOD_LABEL,
  financialReportParams,
  readFinancialReportFilters,
} from "@/components/financial-report/financial-report-filters";
import {
  originText,
  paidDay,
} from "@/components/financial-report/ReceivedPaymentList";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintTable } from "@/components/shared/PrintTable";
import { getCurrentUser } from "@/services/auth.service";
import {
  getFinancialReport,
  listReceivedPayments,
} from "@/services/financial-report.service";
import { listPaymentMethods } from "@/services/payment-method.service";
import { fetchAllPages } from "@/utils/fetch-all-pages";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

const day = (value: string) => formatDateOnly(`${value}T00:00:00Z`);

/**
 * Relatório financeiro para imprimir (screens/relatorio-financeiro.md): os
 * mesmos filtros da tela, com o extrato inteiro.
 */
export async function FinancialReportPrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [{ company }, methods] = await Promise.all([
    getCurrentUser(),
    fetchAllPages((page, limit) => listPaymentMethods({ page, limit })),
  ]);
  const month = monthOf(toDateString(new Date(), company.timezone));
  const filters = readFinancialReportFilters(
    searchParams,
    methods.map((method) => method.id),
  );
  const method = methods.find((item) => item.id === filters.method);
  const params = financialReportParams(filters);

  const [report, payments] = await Promise.all([
    getFinancialReport(params),
    fetchAllPages((page, limit) =>
      listReceivedPayments({ ...params, page, limit }),
    ),
  ]);

  return (
    <>
      <AutoPrint />
      <PrintHeader
        title="Financeiro"
        companyName={company.name}
        timeZone={company.timezone}
        details={[
          `Método de pagamento: ${method?.name ?? "Todos"}`,
          `Período (data do pagamento): ${day(filters.from || month.from)} a ${day(filters.to || month.to)}`,
        ]}
      />
      <FinancialReportCards report={report} />
      <div className="grid gap-3">
        <FinancialPeriodChart series={report.series} print />
        <FinancialMethodTable methods={report.byMethod} />
      </div>
      <section className="space-y-2 print:break-before-page">
        <h2 className="font-semibold">Extrato</h2>
        <PrintTable
          columns={["Data", "Cliente", "Origem", "Método", "Valor"]}
          emptyMessage="Nenhum pagamento recebido no período."
          rows={payments.map((payment) => [
            paidDay(payment.paidAt, company.timezone),
            payment.client.name,
            originText(payment),
            payment.method?.name ?? NO_METHOD_LABEL,
            formatPrice(payment.amount),
          ])}
        />
      </section>
    </>
  );
}
