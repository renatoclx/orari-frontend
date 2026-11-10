// Filtros do Contas a pagar (na URL), comuns ao servidor e à barra de filtros.
import type { PayableApiStatus } from "@/types/payable";
import { isDateString } from "@/utils/time";

export const PAYABLES_PATH = "/financeiro/contas-a-pagar";

/** Situações do filtro (?status=) e o que cada uma pede à API. */
export const PAYABLE_FILTERS = [
  { id: "pendentes", label: "Pendentes", api: "pending" },
  { id: "atrasadas", label: "Atrasadas", api: "overdue" },
  { id: "a-vencer", label: "A vencer", api: "upcoming" },
  { id: "pagas", label: "Pagas", api: "paid" },
  { id: "canceladas", label: "Canceladas", api: "cancelled" },
  { id: "todas", label: "Todas", api: "all" },
] as const satisfies readonly {
  id: string;
  label: string;
  api: PayableApiStatus;
}[];

export type PayableFilterId = (typeof PAYABLE_FILTERS)[number]["id"];
export const DEFAULT_PAYABLE_FILTER: PayableFilterId = "pendentes";

/** Valor "todos" dos selects de favorecido e categoria. */
export const ALL = "all";

export type PayableFiltersState = {
  status: PayableFilterId;
  /** Vencimento, "aaaa-mm-dd"; vazio = sem limite. */
  from: string;
  to: string;
  payee: string;
  category: string;
};

type SearchParams = Record<string, string | string[] | undefined>;
const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

/** Lê a URL (?status=, ?de=, ?ate=, ?favorecido=, ?categoria=); inválido é ignorado. */
export function readPayableFilters(
  searchParams: SearchParams,
): PayableFiltersState {
  const status =
    PAYABLE_FILTERS.find((item) => item.id === searchParams.status)?.id ??
    DEFAULT_PAYABLE_FILTER;
  const from = text(searchParams.de);
  const to = text(searchParams.ate);
  return {
    status,
    from: isDateString(from) ? from : "",
    to: isDateString(to) ? to : "",
    payee: text(searchParams.favorecido) || ALL,
    category: text(searchParams.categoria) || ALL,
  };
}

/** Query string só com o que não é o padrão. */
export function payableQuery(
  filters: PayableFiltersState,
  overrides: Partial<PayableFiltersState> = {},
): URLSearchParams {
  const next = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (next.status !== DEFAULT_PAYABLE_FILTER) query.set("status", next.status);
  if (next.from) query.set("de", next.from);
  if (next.to) query.set("ate", next.to);
  if (next.payee !== ALL) query.set("favorecido", next.payee);
  if (next.category !== ALL) query.set("categoria", next.category);
  return query;
}

/** "Aluguel (11/12)" quando a conta é de uma série. */
export const payableTitle = (payable: {
  description: string;
  installment: number | null;
  installments: number | null;
}) =>
  payable.installment && payable.installments
    ? `${payable.description} (${payable.installment}/${payable.installments})`
    : payable.description;
