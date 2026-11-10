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
  /** Quem lançou. */
  createdBy: { id: string; name: string };
  createdAt: string;
};

/** Corpo do POST /commission-advances. */
export type CommissionAdvanceInput = {
  professionalId: string;
  amount: number;
  date: string;
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
};
