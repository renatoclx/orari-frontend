// Assinatura da empresa (GET /subscriptions e /companies/:id/subscription; só
// o SUPER_ADMIN). Ver screens/assinaturas.md.

export type SubscriptionPlan = "ESSENTIAL" | "PLUS" | "CLINICAL";
export type BillingCycle = "MONTHLY" | "SEMIANNUAL" | "ANNUAL";
export type SubscriptionStatus =
  "TRIAL" | "ACTIVE" | "OVERDUE" | "READ_ONLY" | "CANCELED";

export type Subscription = {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  extraProfessionals: number;
  anamnesisAddon: boolean;
  /** Valor do ciclo (guardado: reajuste da tabela não muda quem já contratou). */
  price: number;
  discountPercent: number | null;
  /** Datas "aaaa-mm-dd". */
  discountUntil: string | null;
  trialEndsAt: string | null;
  paidUntil: string | null;
  canceledAt: string | null;
  status: SubscriptionStatus;
  readOnly: boolean;
  /** Último dia da situação atual (fim do teste, vencimento ou da tolerância). */
  endsAt: string | null;
};

/** Uma linha da tela Assinaturas: a empresa, com ou sem assinatura. */
export type CompanySubscriptionItem = {
  companyId: string;
  companyName: string;
  isActive: boolean;
  subscription: Subscription | null;
};

export type SubscriptionInput = {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  extraProfessionals: number;
  anamnesisAddon: boolean;
  price: number;
  discountPercent: number | null;
  discountUntil: string | null;
  trialEndsAt: string | null;
  paidUntil: string | null;
  canceledAt: string | null;
};
