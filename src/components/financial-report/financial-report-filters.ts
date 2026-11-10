// Filtros do relatório financeiro (na URL), comuns ao servidor e ao navegador.
import { isDateString } from "@/utils/time";

export const FINANCIAL_REPORT_PATH = "/relatorios/financeiro";

/** Valor do "Todos os métodos" no Select (o Radix não aceita vazio). */
export const ALL_METHODS = "todos";

export type FinancialReportFilters = {
  /** Id do método de pagamento ou ALL_METHODS. */
  method: string;
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/**
 * Filtros a partir da URL (?metodo=, ?de=, ?ate=), da tela e da versão
 * impressa. Método desconhecido vira "todos"; o período só vale com as duas
 * datas em ordem.
 */
export function readFinancialReportFilters(
  searchParams: SearchParams,
  methodIds: string[],
): FinancialReportFilters {
  const chosen = text(searchParams.metodo);
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return {
    method: methodIds.includes(chosen) ? chosen : ALL_METHODS,
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
  };
}

/** Parâmetros da URL; o padrão (todos, mês atual) fica de fora. */
export function financialReportQuery(
  filters: FinancialReportFilters,
  month: { from: string; to: string },
  overrides: Partial<FinancialReportFilters> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.method !== ALL_METHODS) query.set("metodo", next.method);
  if (next.from || next.to) {
    const from = next.from || month.from;
    const to = next.to || month.to;
    if (from !== month.from || to !== month.to) {
      query.set("de", from);
      query.set("ate", to);
    }
  }
  return query;
}

/** Filtros no formato da API (o padrão vira "sem filtro"). */
export function financialReportParams(filters: FinancialReportFilters) {
  return {
    from: filters.from || undefined,
    to: filters.to || undefined,
    paymentMethodId:
      filters.method === ALL_METHODS ? undefined : filters.method,
  };
}

/** Nome da origem do pagamento. */
export const ORIGIN_LABELS = {
  appointment: "Atendimento",
  package: "Pacote",
} as const;

/** Linha do pagamento sem método. */
export const NO_METHOD_LABEL = "Sem método";
