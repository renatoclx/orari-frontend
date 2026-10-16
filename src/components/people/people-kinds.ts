import type { PeopleType } from "@/types/people";

// Tipos de pessoa que compartilham as mesmas telas (screens/pessoas.md): cada um
// referencia um PeopleType do backend. Usuários são outra entidade (UserType).
export type PeopleKind = {
  type: PeopleType;
  /** Caminho da listagem, ex.: "/clientes". */
  path: string;
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
    plural: "Clientes",
    singular: "cliente",
    singularTitle: "Cliente",
  },
  EMPLOYEE: {
    type: "EMPLOYEE",
    path: "/funcionarios",
    plural: "Funcionários",
    singular: "funcionário",
    singularTitle: "Funcionário",
  },
  PROFESSIONAL: {
    type: "PROFESSIONAL",
    path: "/profissionais",
    plural: "Profissionais",
    singular: "profissional",
    singularTitle: "Profissional",
  },
};

/** Confere um valor vindo do navegador (não confiável) contra os tipos. */
export function isPeopleType(value: unknown): value is PeopleType {
  return typeof value === "string" && value in PEOPLE_KINDS;
}
