// Espelham as respostas do módulo auth do backend (auth.service.ts).

/** Resposta de POST /auth/login e POST /auth/refresh. */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

import type { FeatureAccessEntry } from "@/types/company-access";

/** Espelha o enum UserType do backend. */
export type UserType = "SUPER_ADMIN" | "ADMIN" | "USER" | "PROFESSIONAL";

/** Resposta de GET /auth/me: quem está logado e em qual empresa. */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  /** Telefone de login do usuário só de app (profissional); nulo nos demais. */
  phone: string | null;
  type: UserType;
  /** Profissional vinculado ao usuário (ativo); nulo sem vínculo. Dá acesso à anamnese. */
  professional: { id: string; name: string } | null;
  /** Pessoa vinculada ativa (profissional ou funcionário), com o cargo; nula sem vínculo. */
  person: {
    id: string;
    name: string;
    type: "PROFESSIONAL" | "EMPLOYEE";
    profession: string | null;
  } | null;
  company: {
    id: string;
    /** Nome fantasia; sem ele, a razão social. */
    name: string;
    /** Fuso da empresa: a agenda exibe os horários nele. */
    timezone: string;
    logoUrl: string | null;
  };
  /** O que a empresa do usuário enxerga (esconde menus e telas; a API é quem barra). */
  access: { features: FeatureAccessEntry[] };
};
