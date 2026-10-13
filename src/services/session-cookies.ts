import type { AuthTokens } from "@/types/auth";

// Nomes e regras dos cookies da sessão, compartilhados entre o proxy e a
// camada de sessão. Sem "server-only": o proxy também usa este arquivo.
export const ACCESS_TOKEN_COOKIE = "orari_access";
export const REFRESH_TOKEN_COOKIE = "orari_refresh";

// Mesmo prazo do JWT_REFRESH_EXPIRES_IN do backend (7d). O refresh token é
// opaco, não carrega a própria validade.
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

// Usado só se a validade do access token não puder ser lida (JWT_EXPIRES_IN=1d).
const FALLBACK_ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;

const baseOptions = {
  // O JavaScript da página não lê o cookie: um script malicioso não rouba o token.
  httpOnly: true,
  // Em produção, só trafega por HTTPS.
  secure: process.env.NODE_ENV === "production",
  // Outro site não consegue usar o cookie para agir em nome do usuário.
  sameSite: "lax",
  path: "/",
} as const;

/**
 * Segundos até o access token vencer, lidos do próprio JWT (campo `exp`).
 * Não valida a assinatura — isso é papel da API —, só lê a data.
 */
function secondsUntilExpiry(jwt: string): number {
  try {
    const payload = jwt.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    if (!exp) return FALLBACK_ACCESS_TOKEN_MAX_AGE;
    return Math.max(exp - Math.floor(Date.now() / 1000), 0);
  } catch {
    return FALLBACK_ACCESS_TOKEN_MAX_AGE;
  }
}

/** Os dois cookies da sessão, prontos para gravar (pela action ou pelo proxy). */
export function buildSessionCookies(tokens: AuthTokens) {
  return [
    {
      name: ACCESS_TOKEN_COOKIE,
      value: tokens.accessToken,
      // O cookie vence junto com o token: quando ele some, o proxy renova.
      options: {
        ...baseOptions,
        maxAge: secondsUntilExpiry(tokens.accessToken),
      },
    },
    {
      name: REFRESH_TOKEN_COOKIE,
      value: tokens.refreshToken,
      options: { ...baseOptions, maxAge: REFRESH_TOKEN_MAX_AGE },
    },
  ];
}
