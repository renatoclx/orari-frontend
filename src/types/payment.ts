// Espelha a resposta de /payments do backend (só o que as telas usam).

export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED";

export type PaymentItem = {
  id: string;
  /** Em reais (texto decimal). */
  amount: string;
  /** Data de calendário "aaaa-mm-dd"; nula quando não há vencimento. */
  dueDate: string | null;
  paidAt: string | null;
  status: PaymentStatus;
  /** Pendente com vencimento já passado (calculado pela API, no fuso da empresa). */
  isOverdue: boolean;
  /** Cliente: o do atendimento ou o da contratação. */
  client: { id: string; name: string };
  /** Preenchido quando o pagamento está pago. */
  paymentMethod: { id: string; name: string } | null;
  /** Origem: o atendimento avulso/da recorrência ou a contratação. */
  appointment: {
    id: string;
    startAt: string;
    /** Preenchido quando o atendimento é uma sessão de recorrência. */
    recurringAppointmentId: string | null;
    service: { id: string; name: string };
  } | null;
  /** A modalidade diz se é a parcela mensal ou o pagamento integral. */
  clientPlan: {
    id: string;
    billingType: "INTEGRAL" | "MONTHLY";
    plan: { id: string; name: string };
  } | null;
};

/** Pagamento dentro da comanda (GET /payments/checkouts). */
export type CheckoutPayment = {
  id: string;
  /** Em reais (texto decimal). */
  amount: string;
  /** Data de calendário "aaaa-mm-dd"; nula no integral sem vencimento. */
  dueDate: string | null;
  paidAt: string | null;
  status: PaymentStatus;
  paymentMethod: { id: string; name: string } | null;
  appointment: {
    id: string;
    startAt: string;
    service: { id: string; name: string };
  } | null;
  /** A modalidade diz se é a parcela mensal ou o pagamento integral. */
  clientPlan: {
    id: string;
    billingType: "INTEGRAL" | "MONTHLY";
    plan: { id: string; name: string };
  } | null;
};

/** Comanda do dia: o que o cliente movimenta hoje (pendente e pago). */
export type CheckoutItem = {
  client: { id: string; name: string };
  /** Soma de todos os pagamentos da comanda, em reais. */
  total: string;
  /** Soma dos pendentes: zero quando a comanda está paga. */
  pendingTotal: string;
  payments: CheckoutPayment[];
};

/** Totais do resumo (GET /payments/summary): em reais (texto) e quantidade. */
export type PaymentTotal = { total: string; count: number };

export type PaymentSummary = {
  /** Pendentes vencidos. */
  overdue: PaymentTotal;
  /** Pendentes que vencem de hoje em diante ou não têm vencimento. */
  upcoming: PaymentTotal;
  paid: PaymentTotal;
};
