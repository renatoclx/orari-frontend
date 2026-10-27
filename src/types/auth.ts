// Espelham as respostas do módulo auth do backend (auth.service.ts).

/** Resposta de POST /auth/login e POST /auth/refresh. */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/** Espelha o enum UserType do backend. */
export type UserType = "SUPER_ADMIN" | "ADMIN" | "USER";

/** Resposta de GET /auth/me: quem está logado e em qual empresa. */
export type CurrentUser = {
  id: string;
  name: string;
  email: string;
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
};
