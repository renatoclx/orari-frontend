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
