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
};
