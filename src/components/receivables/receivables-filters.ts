// Filtros da Análise de recebíveis (na URL), comuns ao servidor e ao navegador.
import { isDateString } from "@/utils/time";

export const RECEIVABLES_PATH = "/relatorios/analise-de-recebiveis";

export type ReceivablesFiltersState = {
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
  search: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/**
 * Filtros a partir da URL (?de=, ?ate=, ?q=), da tela e da versão impressa.
 * O período só vale com as duas datas; fim antes do início é ignorado.
 */
export function readReceivablesFilters(
  searchParams: SearchParams,
): ReceivablesFiltersState {
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return {
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
    search: text(searchParams.q),
  };
}

/** Rótulo de cada faixa de atraso. */
export const AGING_LABELS = {
  "1-30": "1 a 30 dias",
  "31-60": "31 a 60 dias",
  "61-90": "61 a 90 dias",
  "90+": "Mais de 90 dias",
} as const;

/**
 * Parâmetros da URL a partir dos filtros (página volta à primeira). O mês
 * atual fica de fora, para a URL ficar limpa; as duas datas vão juntas.
 */
export function receivablesQuery(
  filters: ReceivablesFiltersState,
  month: { from: string; to: string },
  overrides: Partial<ReceivablesFiltersState> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.from || next.to) {
    const from = next.from || month.from;
    const to = next.to || month.to;
    if (from !== month.from || to !== month.to) {
      query.set("de", from);
      query.set("ate", to);
    }
  }
  if (next.search.trim()) query.set("q", next.search.trim());
  return query;
}

/** Link para Contas a receber (Financeiro) com os atrasados (de um cliente, se informado). */
export function overduePaymentsHref(clientId?: string) {
  const query = new URLSearchParams({ status: "atrasados" });
  if (clientId) query.set("cliente", clientId);
  return `/pagamentos?${query}`;
}
