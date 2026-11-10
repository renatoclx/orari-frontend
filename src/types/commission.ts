// Comissões dos profissionais (screens/comissoes.md). Valores em texto, duas casas.

import type { CommissionType } from "@/types/service";

export type CommissionTotals = {
  count: number;
  base: string;
  amount: string;
  /** Quanto da base os clientes já pagaram. */
  clientPaid: string;
};

export type CommissionSummary = CommissionTotals & {
  byProfessional: (CommissionTotals & { id: string; name: string })[];
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
