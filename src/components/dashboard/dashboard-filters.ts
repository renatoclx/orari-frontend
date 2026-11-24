// Filtros e contas do Dashboard (na URL), comuns ao servidor e ao navegador.
import { isDateString, shiftDateString } from "@/utils/time";

export const DASHBOARD_PATH = "/dashboard";

export type DashboardFilters = {
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/** Período a partir da URL (?de=, ?ate=); só vale com as duas datas em ordem. */
export function readDashboardFilters(
  searchParams: SearchParams,
): DashboardFilters {
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return { from: validPeriod ? from : "", to: validPeriod ? to : "" };
}

/** Parâmetros da URL; o mês atual fica de fora. */
export function dashboardQuery(
  filters: DashboardFilters,
  month: { from: string; to: string },
  overrides: Partial<DashboardFilters> = {},
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
  return query;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const lastDayOf = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * O período anterior, para a comparação: um mês inteiro compara com o mês
 * anterior inteiro; qualquer outro, com os dias logo antes, do mesmo tamanho.
 */
export function previousPeriod(
  from: string,
  to: string,
): { from: string; to: string; label: string } {
  const [year, month, day] = from.split("-").map(Number);
  const wholeMonth =
    day === 1 &&
    to.slice(0, 7) === from.slice(0, 7) &&
    Number(to.slice(8)) === lastDayOf(year, month);
  if (wholeMonth) {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prefix = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
    return {
      from: `${prefix}-01`,
      to: `${prefix}-${String(lastDayOf(prevYear, prevMonth)).padStart(2, "0")}`,
      label: "mês anterior",
    };
  }
  const days =
    Math.round(
      (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
        DAY_MS,
    ) + 1;
  return {
    from: shiftDateString(from, -days),
    to: shiftDateString(from, -1),
    label: "período anterior",
  };
}

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});
const points = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/**
 * Variação de um valor em relação ao anterior, em texto: "+12% vs. mês
 * anterior". Sem nada no anterior não há base para a porcentagem.
 */
export function changeText(current: number, previous: number, label: string) {
  if (current === previous) return `Igual ao ${label}`;
  if (previous === 0) {
    return `Nada no ${label} para comparar`;
  }
  return `${percent.format((current - previous) / previous)} vs. ${label}`;
}

/** Variação de uma taxa (0 a 1) em pontos percentuais: "-2,5 p.p. vs. …". */
export function rateChangeText(
  current: number | null,
  previous: number | null,
  label: string,
) {
  if (current === null || previous === null) {
    return `Sem base no ${label} para comparar`;
  }
  const diff = (current - previous) * 100;
  return Math.abs(diff) < 0.05
    ? `Igual ao ${label}`
    : `${points.format(diff)} p.p. vs. ${label}`;
}
