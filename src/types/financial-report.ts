// Relatório financeiro: o que entrou no caixa (screens/relatorio-financeiro.md).

/** Origem do pagamento: atendimento, contratação de pacote ou venda de produtos. */
export type ReceivedOrigin = "appointment" | "package" | "product";

/** Valores em texto com duas casas. */
export type ReceivedTotal = { count: number; amount: string };

export type FinancialReportPoint = {
  /** Primeiro dia do intervalo, "aaaa-mm-dd". */
  date: string;
  appointments: string;
  packages: string;
  products: string;
};

export type FinancialReportMethod = ReceivedTotal & {
  /** null: pagamento sem método. */
  id: string | null;
  name: string | null;
  /** Parte do recebido, de 0 a 1. */
  share: number;
};

export type FinancialReport = {
  received: ReceivedTotal;
  appointments: ReceivedTotal;
  packages: ReceivedTotal;
  products: ReceivedTotal;
  series: { unit: "day" | "week"; points: FinancialReportPoint[] };
  byMethod: FinancialReportMethod[];
};

export type ReceivedItem = {
  id: string;
  paidAt: string;
  amount: string;
  origin: ReceivedOrigin;
  /** Serviço do atendimento, nome do pacote ou os produtos vendidos. */
  description: string;
  client: { id: string; name: string };
  method: { id: string; name: string } | null;
};
