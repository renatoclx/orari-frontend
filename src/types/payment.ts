// Espelha a resposta de /payments do backend (só o que as telas usam).
import type { AppointmentStatus } from "@/types/appointment";

export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED";

/** Item de uma venda de produtos: quantidade e valor cobrado por unidade (texto). */
export type SaleItem = {
  quantity: number;
  unitPrice: string;
  product: { id: string; name: string };
};

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
  /** Cliente: o do atendimento, o da contratação ou o da venda. */
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
  /** Terceira origem: a venda de produtos (protegida; muda só pela venda). */
  productSale: { id: string; createdAt: string; items: SaleItem[] } | null;
};

/** Pagamento de um atendimento de hoje, dentro da comanda (sem origem nem cliente). */
export type CheckoutAppointmentPayment = Pick<
  PaymentItem,
  | "id"
  | "amount"
  | "dueDate"
  | "paidAt"
  | "status"
  | "isOverdue"
  | "paymentMethod"
>;

/** Atendimento do cliente hoje (GET /payments/checkouts). */
export type CheckoutAppointment = {
  id: string;
  startAt: string;
  status: AppointmentStatus;
  /** price: valor de quem recebe antes da conclusão (em reais, texto); null sem preço. */
  service: { id: string; name: string; price: string | null };
  professional: { id: string; name: string };
  /** Preenchido quando o atendimento é uma sessão de recorrência (ou de pacote). */
  recurringAppointmentId: string | null;
  /** Preenchido quando a sessão é de um pacote: não tem cobrança própria. */
  clientPlanId: string | null;
  /** Nulo enquanto o pagamento não existe (avulso ainda não concluído) ou no pacote. */
  payment: CheckoutAppointmentPayment | null;
};

/** Venda de produtos de hoje, dentro da comanda (as canceladas não vêm). */
export type CheckoutProductSale = {
  id: string;
  createdAt: string;
  items: SaleItem[];
  /** Nulo só se o pagamento sumiu (não deveria acontecer). */
  payment: CheckoutAppointmentPayment | null;
};

/** Comanda do dia: a visão de hoje de um cliente. */
export type CheckoutItem = {
  client: { id: string; name: string };
  appointments: CheckoutAppointment[];
  /** Vendas de produtos de hoje, somadas aos totais de hoje. */
  productSales: CheckoutProductSale[];
  /** Pendências anteriores e o que foi pago hoje fora dos atendimentos de hoje. */
  previousPayments: Omit<PaymentItem, "client">[];
  /** Em reais (texto decimal). */
  todayPending: string;
  previousPending: string;
  paidToday: string;
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
