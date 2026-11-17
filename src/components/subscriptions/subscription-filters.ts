import type { CompanySubscriptionItem } from "@/types/subscription";

// Filtro de situação da tela Assinaturas (?situacao=). Fica num .ts comum: o
// servidor filtra e a barra (cliente) mostra as opções.
export const SUBSCRIPTION_FILTERS: {
  id: string;
  label: string;
  matches: (item: CompanySubscriptionItem) => boolean;
}[] = [
  { id: "todas", label: "Todas as situações", matches: () => true },
  {
    id: "sem-assinatura",
    label: "Sem assinatura",
    matches: (item) => item.subscription === null,
  },
  {
    id: "em-teste",
    label: "Em teste",
    matches: (item) => item.subscription?.status === "TRIAL",
  },
  {
    id: "ativas",
    label: "Ativas",
    matches: (item) => item.subscription?.status === "ACTIVE",
  },
  {
    id: "em-atraso",
    label: "Em atraso",
    matches: (item) => item.subscription?.status === "OVERDUE",
  },
  {
    id: "somente-leitura",
    label: "Somente leitura",
    matches: (item) => item.subscription?.status === "READ_ONLY",
  },
  {
    id: "canceladas",
    label: "Canceladas",
    matches: (item) => item.subscription?.status === "CANCELED",
  },
];
