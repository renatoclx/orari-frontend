// Filtros da Carteira de clientes (na URL), comuns ao servidor e ao navegador.
import type { PortfolioStatus } from "@/types/client-portfolio";
import { isDateString } from "@/utils/time";

export const PORTFOLIO_PATH = "/relatorios/carteira-clientes";

/** Opções do filtro de situação (`?situacao=`); "todas" é o padrão. */
export const PORTFOLIO_STATUS_FILTERS: {
  id: string;
  label: string;
  status?: PortfolioStatus;
}[] = [
  { id: "todas", label: "Todas as situações" },
  { id: "novos", label: "Novos", status: "NEW" },
  { id: "ativos", label: "Ativos", status: "ACTIVE" },
  { id: "sem-retorno", label: "Sem retorno", status: "LAPSED" },
];
export const DEFAULT_STATUS_FILTER = "todas";

/** Rótulo e cor do selo de cada situação. */
export const PORTFOLIO_STATUS_BADGES: Record<
  PortfolioStatus,
  { label: string; variant: "secondary" | "success" | "destructive" }
> = {
  NEW: { label: "Novo", variant: "secondary" },
  ACTIVE: { label: "Ativo", variant: "success" },
  LAPSED: { label: "Sem retorno", variant: "destructive" },
};

export type PortfolioFiltersState = {
  professional: string;
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
  status: string;
  search: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/**
 * Filtros a partir da URL (?profissional=, ?de=, ?ate=, ?situacao=, ?q=), da
 * tela e da versão impressa. Valor inválido é ignorado: sem profissional
 * válido, o primeiro da lista; o período só vale com as duas datas em ordem.
 */
export function readPortfolioFilters(
  searchParams: SearchParams,
  professionalIds: string[],
) {
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  const statusFilter =
    PORTFOLIO_STATUS_FILTERS.find(
      (item) => item.id === searchParams.situacao,
    ) ??
    PORTFOLIO_STATUS_FILTERS.find((item) => item.id === DEFAULT_STATUS_FILTER)!;
  const chosen = text(searchParams.profissional);
  const filters: PortfolioFiltersState = {
    professional: professionalIds.includes(chosen)
      ? chosen
      : (professionalIds[0] ?? ""),
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
    status: statusFilter.id,
    search: text(searchParams.q),
  };
  return { filters, statusFilter };
}

/** Primeiro e último dia do mês de `today` ("aaaa-mm-dd"). */
export function monthOf(today: string): { from: string; to: string } {
  const [year, month] = today.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = today.slice(0, 7);
  return {
    from: `${prefix}-01`,
    to: `${prefix}-${String(last).padStart(2, "0")}`,
  };
}

/**
 * Parâmetros da URL a partir dos filtros (página volta à primeira). O padrão
 * fica de fora, para a URL ficar limpa. Trocar uma das datas leva a outra
 * junto (`month`), senão a API completaria o período por conta própria.
 */
export function portfolioQuery(
  filters: PortfolioFiltersState,
  month: { from: string; to: string },
  overrides: Partial<PortfolioFiltersState> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.professional) query.set("profissional", next.professional);
  if (next.from || next.to) {
    const from = next.from || month.from;
    const to = next.to || month.to;
    if (from !== month.from || to !== month.to) {
      query.set("de", from);
      query.set("ate", to);
    }
  }
  if (next.status !== DEFAULT_STATUS_FILTER) query.set("situacao", next.status);
  if (next.search.trim()) query.set("q", next.search.trim());
  return query;
}

/**
 * Nova data do período. As duas vão juntas para a URL; se o início passar do
 * fim (ou o contrário), a outra acompanha. Data apagada volta ao mês atual.
 */
export function changeDate(
  filters: Pick<PortfolioFiltersState, "from" | "to">,
  month: { from: string; to: string },
  field: "from" | "to",
  value: string,
): Pick<PortfolioFiltersState, "from" | "to"> {
  if (!value) return { from: "", to: "" };
  const from = field === "from" ? value : filters.from || month.from;
  const to = field === "to" ? value : filters.to || month.to;
  if (from > to)
    return field === "from" ? { from, to: from } : { from: to, to };
  return { from, to };
}
