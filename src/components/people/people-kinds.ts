import type { PeopleType } from "@/types/people";

// Tipos de pessoa que compartilham as mesmas telas (screens/pessoas.md): cada um
// referencia um PeopleType do backend. Usuários são outra entidade (UserType).
export type PeopleKind = {
  type: PeopleType;
  /** Caminho da listagem, ex.: "/clientes". */
  path: string;
  /** Funcionalidade liberada por empresa (Acessos e limites). */
  feature: string;
  /** "Clientes" */
  plural: string;
  /** "cliente" */
  singular: string;
  /** "Cliente" */
  singularTitle: string;
};

/** Configuração de cada tipo de pessoa: as três telas são a mesma implementação, escolhida por aqui. */
export const PEOPLE_KINDS: Record<PeopleType, PeopleKind> = {
  CLIENT: {
    type: "CLIENT",
    path: "/clientes",
    feature: "clients",
    plural: "Clientes",
    singular: "cliente",
    singularTitle: "Cliente",
  },
  EMPLOYEE: {
    type: "EMPLOYEE",
    path: "/funcionarios",
    feature: "employees",
    plural: "Funcionários",
    singular: "funcionário",
    singularTitle: "Funcionário",
  },
  PROFESSIONAL: {
    type: "PROFESSIONAL",
    path: "/profissionais",
    feature: "professionals",
    plural: "Profissionais",
    singular: "profissional",
    singularTitle: "Profissional",
  },
  // Favorecido das contas a pagar (2026-11-10).
  SUPPLIER: {
    type: "SUPPLIER",
    path: "/fornecedores",
    feature: "suppliers",
    plural: "Fornecedores",
    singular: "fornecedor",
    singularTitle: "Fornecedor",
  },
};

/** Valor do "Sem categoria" no Select do fornecedor (o Radix não aceita vazio). */
export const NO_CATEGORY = "NONE";

/** Confere um valor vindo do navegador (não confiável) contra os tipos. */
export function isPeopleType(value: unknown): value is PeopleType {
  return typeof value === "string" && value in PEOPLE_KINDS;
}
