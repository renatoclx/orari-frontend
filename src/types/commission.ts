// Comissões dos profissionais (screens/comissoes.md). Valores em texto, duas casas.

import type { CommissionType } from "@/types/service";

export type CommissionTotals = {
  count: number;
  base: string;
  amount: string;
  /** Quanto da base os clientes já pagaram. */
  clientPaid: string;
};

/** Em aberto (ainda não fechado), sem depender do período. */
export type OpenTotals = {
  advanced: string;
  /** Comissão em aberto menos o adiantado. */
  toPay: string;
};

export type CommissionSummary = CommissionTotals &
  OpenTotals & {
    byProfessional: (CommissionTotals &
      OpenTotals & { id: string; name: string })[];
  };

export type CommissionAdvance = {
  id: string;
  amount: string;
  /** "aaaa-mm-dd". */
  date: string;
  note: string | null;
  /** Como foi pago; vazio nos lançados antes de o campo existir. */
  paymentMethod: { id: string; name: string } | null;
  /** Quem lançou. */
  createdBy: { id: string; name: string };
  createdAt: string;
  /** Fechamento que o abateu; null = em aberto. */
  closing: { id: string; number: number } | null;
};

/** Corpo do POST /commission-advances. */
export type CommissionAdvanceInput = {
  professionalId: string;
  amount: number;
  date: string;
  paymentMethodId: string;
  note?: string;
};

export type CommissionItem = {
  id: string;
  appointment: {
    id: string;
    startAt: string;
    client: { id: string; name: string };
    service: { id: string; name: string };
    /** Sessão de pacote: a base é a parte da contratação. */
    fromPackage: boolean;
  };
  professional: { id: string; name: string };
  baseAmount: string;
  type: CommissionType;
  /** Percentual ou valor fixo da regra na geração. */
  rate: string;
  amount: string;
  clientPaid: string;
  /** Fechamento que a quitou; null = em aberto. */
  closing: { id: string; number: number } | null;
};

/** O que está em aberto até a data de corte. */
export type ClosingPreview = {
  commissions: { count: number; amount: string };
  advances: { count: number; amount: string };
  toPay: string;
};

export type ClosingItem = {
  id: string;
  number: number;
  /** "aaaa-mm-dd". */
  cutoffDate: string;
  paidAt: string;
  paymentMethod: { id: string; name: string };
  commissionTotal: string;
  advanceTotal: string;
  paidAmount: string;
  appointmentsCount: number;
  createdBy: { id: string; name: string };
  createdAt: string;
  /** Desfeito (recibo cancelado). */
  cancelledAt: string | null;
};

export type ClosingReceipt = ClosingItem & {
  company: { name: string; corporateReason: string; document: string };
  professional: { id: string; name: string; document: string | null };
  cancelledBy: { id: string; name: string } | null;
  details: {
    commissions: {
      startAt: string;
      client: string;
      service: string;
      base: string;
      amount: string;
    }[];
    advances: { date: string; note: string | null; amount: string }[];
  };
};

/** Corpo do POST /commission-closings. */
export type ClosingInput = {
  professionalId: string;
  until: string;
  paymentMethodId: string;
  paidAt: string;
};
