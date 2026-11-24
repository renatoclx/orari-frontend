// Pagamentos da assinatura (cobrança manual do SUPER_ADMIN): ver
// screens/cobrancas.md.

export type SubscriptionPaymentMethod =
  "PIX" | "CARD" | "BOLETO" | "TRANSFER" | "CASH" | "OTHER";

export type SubscriptionPaymentItem = {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  /** Datas "aaaa-mm-dd". */
  paidAt: string;
  method: SubscriptionPaymentMethod;
  periodStart: string;
  periodEnd: string;
  note: string | null;
  /** Só o mais recente da empresa pode ser excluído. */
  removable: boolean;
};

/** Próximo período do ciclo e o valor com o desconto que valer nele. */
export type PaymentSuggestion = {
  periodStart: string;
  periodEnd: string;
  amount: number;
};

export type CompanyPayments = {
  items: SubscriptionPaymentItem[];
  /** Nula quando a empresa não tem assinatura. */
  suggestion: PaymentSuggestion | null;
};

export type MonthPayments = {
  month: string;
  items: SubscriptionPaymentItem[];
  total: number;
  count: number;
};

export type SubscriptionPaymentInput = {
  amount: number;
  paidAt: string;
  method: SubscriptionPaymentMethod;
  periodStart: string;
  periodEnd: string;
  note: string | null;
};
