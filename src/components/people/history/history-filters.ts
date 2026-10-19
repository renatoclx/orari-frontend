// Filtros da aba de agendamentos do histórico. Ficam fora do componente de
// cliente: a página (Server Component) também lê a lista, e um valor importado
// de um arquivo "use client" chega ao servidor só como referência.

/** Filtros da aba: próximos e anteriores (todos os status) ou um status só. */
export const HISTORY_FILTERS = [
  { id: "proximos", label: "Próximos", empty: "Nenhum agendamento marcado." },
  {
    id: "anteriores",
    label: "Anteriores",
    empty: "Nenhum agendamento anterior.",
  },
  {
    id: "cancelados",
    label: "Cancelados",
    empty: "Nenhum agendamento cancelado.",
  },
  {
    id: "faltas",
    label: "Não compareceu",
    empty: "Nenhuma falta registrada.",
  },
] as const;

export type HistoryFilter = (typeof HISTORY_FILTERS)[number]["id"];
