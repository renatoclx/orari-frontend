import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { FinancialReport, ReceivedItem } from "@/types/financial-report";

type FinancialReportParams = {
  /** "aaaa-mm-dd"; sem as duas, o mês atual. */
  from?: string;
  to?: string;
  paymentMethodId?: string;
};

function reportQuery(params: FinancialReportParams) {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.paymentMethodId) {
    query.set("paymentMethodId", params.paymentMethodId);
  }
  return query;
}

/** Resumo do recebido no período (pela data do pagamento). */
export function getFinancialReport(
  params: FinancialReportParams,
): Promise<FinancialReport> {
  const query = reportQuery(params).toString();
  return apiFetch<FinancialReport>(
    `/financial-report${query ? `?${query}` : ""}`,
  );
}

/** Extrato do recebido, do mais recente para o mais antigo. */
export function listReceivedPayments(
  params: FinancialReportParams & { page: number; limit: number },
): Promise<Paginated<ReceivedItem>> {
  const query = reportQuery(params);
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  return apiFetch<Paginated<ReceivedItem>>(
    `/financial-report/payments?${query}`,
  );
}
