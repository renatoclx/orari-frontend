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
  /** Origem (só na listagem): o atendimento avulso/da recorrência ou a contratação. */
  appointment?: {
    id: string;
    startAt: string;
    service: { id: string; name: string };
  } | null;
  clientPlan?: { id: string; plan: { id: string; name: string } } | null;
};
