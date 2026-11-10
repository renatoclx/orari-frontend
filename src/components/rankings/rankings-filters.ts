// Filtros dos Rankings (na URL), comuns ao servidor e ao navegador.
import type { RankingSort } from "@/types/rankings";
import { isDateString } from "@/utils/time";

export const RANKINGS_PATH = "/relatorios/rankings";

/** Opções de ordem (`?ordem=`); faturamento é o padrão. */
export const RANKING_SORTS: { id: string; label: string; sort: RankingSort }[] =
  [
    { id: "faturamento", label: "Ordenar por faturamento", sort: "amount" },
    { id: "quantidade", label: "Ordenar por quantidade", sort: "count" },
  ];
export const DEFAULT_RANKING_SORT = "faturamento";

/** Quantos aparecem na tela; a impressão traz todos. */
export const SCREEN_LIMIT = 10;

export type RankingsFilters = {
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
  /** Id de RANKING_SORTS. */
  sort: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/** Filtros a partir da URL (?de=, ?ate=, ?ordem=); valor inválido é ignorado. */
export function readRankingsFilters(searchParams: SearchParams) {
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  const sort =
    RANKING_SORTS.find((item) => item.id === searchParams.ordem) ??
    RANKING_SORTS.find((item) => item.id === DEFAULT_RANKING_SORT)!;
  const filters: RankingsFilters = {
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
    sort: sort.id,
  };
  return { filters, sort: sort.sort };
}

/** Parâmetros da URL; o padrão (mês atual, faturamento) fica de fora. */
export function rankingsQuery(
  filters: RankingsFilters,
  month: { from: string; to: string },
  overrides: Partial<RankingsFilters> = {},
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
  if (next.sort !== DEFAULT_RANKING_SORT) query.set("ordem", next.sort);
  return query;
}
