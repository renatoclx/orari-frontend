// Contas a pagar (screens/contas-a-pagar.md). Valores em texto, duas casas.

export type PayableStatus = "PENDING" | "PAID" | "CANCELLED";

export type PayableItem = {
  id: string;
  description: string;
  /** Fornecedor ou profissional; null sem favorecido. */
  payee: { id: string; name: string; type: "SUPPLIER" | "PROFESSIONAL" } | null;
  category: { id: string; name: string };
  amount: string;
  /** "aaaa-mm-dd". */
  dueDate: string;
  note: string | null;
  status: PayableStatus;
  /** Pendente com vencimento antes de hoje. */
  overdue: boolean;
  paidAt: string | null;
  paymentMethod: { id: string; name: string } | null;
  seriesId: string | null;
  installment: number | null;
  installments: number | null;
  createdBy: { id: string; name: string };
  createdAt: string;
  cancelledAt: string | null;
};

export type PayableTotal = { count: number; amount: string };

export type PayableSummary = {
  overdue: PayableTotal;
  upcoming: PayableTotal;
  paid: PayableTotal;
};

/** Filtro de situação da API. */
export type PayableApiStatus =
  "pending" | "overdue" | "upcoming" | "paid" | "cancelled" | "all";

/** Corpo do POST /payables. */
export type PayableInput = {
  description: string;
  payeeId: string | null;
  categoryId: string;
  amount: number;
  dueDate: string;
  note: string | null;
  repeat?: { mode: "installments" | "monthly"; count: number };
  paid?: { paidAt: string; paymentMethodId: string };
};
