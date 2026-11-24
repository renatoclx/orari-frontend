// Filtros das Comissões (na URL), comuns ao servidor e ao navegador.
import { isDateString } from "@/utils/time";

export const COMMISSIONS_PATH = "/financeiro/comissoes";

/** Valor do "Todos os profissionais" no Select (o Radix não aceita vazio). */
export const ALL_PROFESSIONALS = "todos";

export type CommissionFilters = {
  /** Id do profissional ou ALL_PROFESSIONALS. */
  professional: string;
  /** "aaaa-mm-dd"; vazias = mês atual. */
  from: string;
  to: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/**
 * Filtros a partir da URL (?profissional=, ?de=, ?ate=). Profissional
 * desconhecido vira "todos"; o período só vale com as duas datas em ordem.
 */
export function readCommissionFilters(
  searchParams: SearchParams,
  professionalIds: string[],
): CommissionFilters {
  const chosen = text(searchParams.profissional);
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  const validPeriod = isDateString(from) && isDateString(to) && from <= to;
  return {
    professional: professionalIds.includes(chosen) ? chosen : ALL_PROFESSIONALS,
    from: validPeriod ? from : "",
    to: validPeriod ? to : "",
  };
}

/** Parâmetros da URL; o padrão (todos, mês atual) fica de fora. */
export function commissionsQuery(
  filters: CommissionFilters,
  month: { from: string; to: string },
  overrides: Partial<CommissionFilters> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.professional !== ALL_PROFESSIONALS) {
    query.set("profissional", next.professional);
  }
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

/** Situação do que o cliente pagou da base: pago, parcial ou a receber. */
export function clientPaidStatus(base: string, clientPaid: string) {
  const paid = Number(clientPaid);
  if (paid <= 0) return "A receber" as const;
  return paid >= Number(base) ? ("Pago" as const) : ("Parcial" as const);
}

/** Número do recibo com quatro dígitos: 1 → "0001". */
export const receiptNumber = (number: number) =>
  String(number).padStart(4, "0");

/** Endereço do recibo de um fechamento (versão de impressão, aba nova). */
export const receiptHref = (closingId: string) =>
  `${COMMISSIONS_PATH}/recibo/${closingId}`;
