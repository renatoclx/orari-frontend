import type { PaymentStatus } from "@/types/payment";

// Situações do filtro (na URL, ?status=) e o que cada uma pede à API. Fica num
// .ts comum porque o servidor e a barra de filtros (cliente) usam a mesma lista.
export const PAYMENT_FILTERS = [
  { id: "pendentes", label: "Pendentes", status: "PENDING" },
  { id: "atrasados", label: "Atrasados", status: "PENDING", overdue: true },
  { id: "a-vencer", label: "A vencer", status: "PENDING", overdue: false },
  { id: "pagos", label: "Pagos", status: "PAID" },
  { id: "cancelados", label: "Cancelados", status: "CANCELLED" },
  { id: "todos", label: "Todos", status: undefined },
] as const satisfies readonly {
  id: string;
  label: string;
  status: PaymentStatus | undefined;
  overdue?: boolean;
}[];

export type PaymentFilterId = (typeof PAYMENT_FILTERS)[number]["id"];

/** O filtro padrão: pendentes (os atrasados estão entre eles). */
export const DEFAULT_PAYMENT_FILTER: PaymentFilterId = "pendentes";

/** Valor "todos" dos selects de cliente e método: o filtro sai da URL. */
export const ALL = "all";

/** Filtros da URL já lidos (e validados) pelo servidor. */
export type PaymentFiltersState = {
  status: PaymentFilterId;
  /** Vencimento, "aaaa-mm-dd"; vazio = sem limite. */
  from: string;
  to: string;
  client: string;
  method: string;
};

/** Monta a query string mantendo só o que não é o padrão. */
export function paymentQuery(
  filters: PaymentFiltersState,
  overrides: Partial<PaymentFiltersState> = {},
): URLSearchParams {
  const current = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (current.status !== DEFAULT_PAYMENT_FILTER) {
    params.set("status", current.status);
  }
  if (current.from) params.set("de", current.from);
  if (current.to) params.set("ate", current.to);
  if (current.client && current.client !== ALL) {
    params.set("cliente", current.client);
  }
  if (current.method && current.method !== ALL) {
    params.set("metodo", current.method);
  }
  return params;
}
