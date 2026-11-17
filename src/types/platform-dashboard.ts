import type {
  BillingCycle,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

// Resposta de GET /platform/dashboard (só o SUPER_ADMIN): ver screens/painel.md.

export type PlatformStatusKey = SubscriptionStatus | "NONE";

export type AttentionItem = {
  companyId: string;
  companyName: string;
  /** "aaaa-mm-dd": fim do teste, último dia antes do bloqueio ou vencimento. */
  date: string;
};

export type PlatformDashboard = {
  revenue: {
    mrr: number;
    mrrWithoutDiscount: number;
    arr: number;
    payingCompanies: number;
    overdueAmount: number;
  };
  trialConversion: { ended: number; converted: number };
  byStatus: { status: PlatformStatusKey; companies: number }[];
  byPlan: { plan: SubscriptionPlan; companies: number; mrr: number }[];
  byCycle: { cycle: BillingCycle; companies: number }[];
  /** 12 meses ("aaaa-mm"), do mais antigo ao atual. */
  companiesByMonth: { month: string; count: number }[];
  appointmentsByMonth: { month: string; count: number }[];
  /** Receita realizada: os pagamentos registrados em Cobranças, por mês. */
  receivedByMonth: { month: string; amount: number }[];
  attention: {
    trialsEnding: AttentionItem[];
    overdue: AttentionItem[];
    renewals: AttentionItem[];
    idle: {
      companyId: string;
      companyName: string;
      /** ISO completo; nulo se nunca criou agendamento. */
      lastActivityAt: string | null;
    }[];
  };
  usage: {
    companyId: string;
    companyName: string;
    status: PlatformStatusKey;
    plan: SubscriptionPlan | null;
    appointments30d: number;
    clients: number;
    professionals: number;
    lastActivityAt: string | null;
  }[];
};
