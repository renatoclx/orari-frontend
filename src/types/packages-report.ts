// Relatório de pacotes: a vida das contratações (screens/relatorio-pacotes.md).

export type PackagesByPlan = {
  id: string;
  name: string;
  /** Novas no período e o valor contratado delas (texto, duas casas). */
  created: number;
  amount: string;
  /** Ativas hoje. */
  active: number;
  /** Canceladas no período. */
  cancelled: number;
};

export type PackagesReport = {
  created: { count: number; amount: string };
  active: number;
  cancelled: number;
  /** Ativas terminando em até 30 dias, sem renovação. */
  ending: number;
  byPlan: PackagesByPlan[];
};

export type EndingContract = {
  id: string;
  client: {
    id: string;
    name: string;
    photoUrl: string | null;
    phone: string | null;
  };
  plan: { id: string; name: string };
  /** "aaaa-mm-dd". */
  endDate: string;
  /** Concluídas de quantas a contratação tem (sem as canceladas). */
  sessions: { completed: number; total: number };
};
