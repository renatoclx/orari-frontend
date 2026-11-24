// Rankings de serviços, profissionais e clientes (screens/rankings.md).

export type RankingSort = "amount" | "count";

/** Valores em texto com duas casas. */
export type RankingRow = {
  id: string;
  name: string;
  completed: number;
  amount: string;
  /** Faturado ÷ concluídos com pagamento; null sem nenhum. */
  average: string | null;
};

export type Rankings = {
  summary: {
    amount: string;
    completed: number;
    average: string | null;
    packages: { count: number; amount: string };
  };
  /** share: parte do faturado dos atendimentos, de 0 a 1. */
  services: (RankingRow & { share: number })[];
  professionals: (RankingRow & { clients: number })[];
  /** amount soma atendimentos e pacotes; packages é a parte dos pacotes. */
  clients: (RankingRow & { packages: string; lastVisit: string | null })[];
};
