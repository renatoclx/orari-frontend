// Espelha a resposta de /client-plans do backend (com cliente, plano e agendas).
import type { RecurrenceDay } from "@/types/recurrence";

export type BillingType = "INTEGRAL" | "MONTHLY";

/** Situação da contratação (filtro da API e etiqueta da tela). */
export type ClientPlanStatus = "active" | "cancelled" | "ended";

/** Agenda de um serviço do plano (uma recorrência por serviço). */
export type ClientPlanSchedule = {
  /** Id da recorrência: os detalhes dela mostram as sessões. */
  id: string;
  isActive: boolean;
  service: { id: string; name: string; color: string | null; duration: number };
  professional: { id: string; name: string; photoUrl: string | null };
  days: RecurrenceDay[];
};

export type ClientPlanItem = {
  id: string;
  billingType: BillingType;
  months: number;
  /** Datas de calendário, "aaaa-mm-dd". */
  startDate: string;
  endDate: string;
  firstDueDate: string | null;
  /** Valores congelados na contratação, em reais (texto decimal). */
  monthlyAmount: string;
  /** Desconto aplicado conforme a modalidade. */
  discountPercent: string;
  totalAmount: string;
  /** Instante do cancelamento (ISO); nulo enquanto não cancelada. */
  cancelledAt: string | null;
  client: { id: string; name: string; photoUrl: string | null };
  plan: { id: string; name: string };
  schedules: ClientPlanSchedule[];
};

/** Corpo de POST /client-plans. */
export type NewClientPlanInput = {
  clientId: string;
  planId: string;
  months: number;
  billingType: BillingType;
  startDate: string;
  firstDueDate?: string;
  schedules: {
    serviceId: string;
    professionalId: string;
    days: RecurrenceDay[];
  }[];
};
