// Carteira de clientes por profissional (screens/carteira-clientes.md).

/** Situação na carteira: Novo (no período), Ativo e Sem retorno (hoje). */
export type PortfolioStatus = "NEW" | "ACTIVE" | "LAPSED";

/** Números dos cartões; valores em texto com duas casas. */
export type PortfolioSummary = {
  clients: number;
  newClients: number;
  lapsedClients: number;
  completed: number;
  packageSessions: number;
  received: string;
  pending: string;
  /** null quando não há atendimento concluído com pagamento. */
  averageTicket: string | null;
  /** Gráfico do período: por dia (até 62 dias) ou por semana. */
  series: {
    unit: "day" | "week";
    points: PortfolioSeriesPoint[];
  };
};

/** Um dia (ou semana) do período; `date` é o primeiro dia, "aaaa-mm-dd". */
export type PortfolioSeriesPoint = {
  date: string;
  completed: number;
  received: string;
  pending: string;
};

export type PortfolioClient = {
  id: string;
  name: string;
  photoUrl: string | null;
  /** Celular do contato principal, só dígitos. */
  phone: string | null;
  status: PortfolioStatus;
  lastCompleted: { startAt: string; serviceName: string } | null;
  nextAt: string | null;
  completedInPeriod: number;
  /** Em aberto com o profissional, qualquer vencimento. */
  pending: string;
};

export type PortfolioParams = {
  professionalId: string;
  /** "aaaa-mm-dd"; sem as duas, o mês atual (padrão da API). */
  from?: string;
  to?: string;
};
