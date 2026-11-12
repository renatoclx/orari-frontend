import {
  ACCESS_TOKEN_COOKIE,
  buildSessionCookies,
} from "@/services/session-cookies";
import type { AuthTokens } from "@/types/auth";
import type { AppSession } from "@/types/client-app";

// Cookie da sessão do app do cliente (/app), separado dos cookies da clínica:
// entrar num não derruba o outro. Sem "server-only": o proxy também usa.
export const APP_SESSION_COOKIE = "orari_app";

/** O cookie pronto para gravar; vence junto com a sessão (90 dias). */
export function buildAppSessionCookie(session: AppSession) {
  return {
    name: APP_SESSION_COOKIE,
    value: session.token,
    options: {
      // O JavaScript da página não lê o cookie: um script malicioso não rouba o token.
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: new Date(session.expiresAt),
    },
  };
}

// Sessão do profissional no app: o mesmo par de tokens da clínica (JWT de acesso
// e refresh), mas em cookies PRÓPRIOS do app. Assim entrar no app não abre o
// sistema web, e o contrário também não.
export const APP_PRO_ACCESS_COOKIE = "orari_app_pro";
export const APP_PRO_REFRESH_COOKIE = "orari_app_pro_refresh";

/** Os cookies do profissional, prontos para gravar (pela action ou pelo proxy). */
export function buildAppProCookies(tokens: AuthTokens) {
  return buildSessionCookies(tokens).map((cookie) => ({
    ...cookie,
    name:
      cookie.name === ACCESS_TOKEN_COOKIE
        ? APP_PRO_ACCESS_COOKIE
        : APP_PRO_REFRESH_COOKIE,
  }));
}
