// Filtros do relatório de pacotes (na URL), comuns ao servidor e ao navegador.
import { isDateString } from "@/utils/time";

export const PACKAGES_REPORT_PATH = "/relatorios/pacotes";

export type PackagesReportFilters = {
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/**
 * Período a partir da URL (?de=, ?ate=), da tela e da versão impressa. Só vale
 * com as duas datas em ordem.
 */
export function readPackagesReportFilters(
  searchParams: SearchParams,
): PackagesReportFilters {
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return { from: validPeriod ? from : "", to: validPeriod ? to : "" };
}

/** Parâmetros da URL; o mês atual fica de fora. */
export function packagesReportQuery(
  filters: PackagesReportFilters,
  month: { from: string; to: string },
  overrides: Partial<PackagesReportFilters> = {},
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

/** "18 de 24" (concluídas de quantas a contratação tem). */
export const sessionsText = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => `${completed} de ${total}`;
