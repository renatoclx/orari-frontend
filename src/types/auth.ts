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
  company: {
    id: string;
    /** Nome fantasia; sem ele, a razão social. */
    name: string;
    /** Fuso da empresa: a agenda exibe os horários nele. */
    timezone: string;
    logoUrl: string | null;
  };
};
