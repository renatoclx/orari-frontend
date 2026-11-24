// Análise de recebíveis da empresa (screens/analise-de-recebiveis.md).

/** Soma (texto com duas casas) e quantidade de pagamentos. */
export type ReceivablesTotal = {
  total: string;
  count: number;
};

/** Faixa de dias de atraso. */
export type AgingKey = "1-30" | "31-60" | "61-90" | "90+";

/** Um mês do gráfico, pelo vencimento ("aaaa-mm"). */
export type ReceivablesMonth = {
  month: string;
  paid: string;
  overdue: string;
  upcoming: string;
};

export type ReceivablesSummary = {
  /** Hoje: todo pendente, com ou sem vencimento. */
  open: ReceivablesTotal;
  /** Hoje: pendente vencido, com quantos clientes devem. */
  overdue: ReceivablesTotal & { clients: number };
  /** Pago no período (pela data do pagamento). */
  received: ReceivablesTotal;
  /** Do que venceu no período até ontem, o que segue pendente; rate de 0 a 1. */
  default: { due: string; unpaid: string; rate: number | null };
  aging: (ReceivablesTotal & { key: AgingKey })[];
  /** Os 5 meses anteriores, o atual e os 3 seguintes. */
  months: ReceivablesMonth[];
};

export type ReceivablesDebtor = {
  id: string;
  name: string;
  photoUrl: string | null;
  /** Celular do contato principal, só dígitos. */
  phone: string | null;
  overdue: string;
  count: number;
  /** "aaaa-mm-dd". */
  oldestDueDate: string;
};
