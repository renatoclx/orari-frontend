// Rotas do app do cliente (/app) e quem pode abrir cada uma (screens/app-cliente.md).
// Sem "server-only": o proxy usa.

export const APP_HOME_PATH = "/app";
export const APP_LOGIN_PATH = "/app/entrar";

// Só para quem não entrou: entrado, vai para o Início.
const GUEST_PATHS = new Set(["/app/entrar", "/app/criar-conta"]);
// Abertas com ou sem a conta entrada (o manifesto é lido pelo celular ao instalar).
const OPEN_PREFIXES = [
  "/app/acesso/",
  "/app/sessao-encerrada",
  "/app/manifest.webmanifest",
];

/**
 * "guest": entrar e criar conta; "open": link de acesso e fim da sessão;
 * "private": as demais do app; null: fora do app (rotas da clínica).
 */
export function appRouteKind(
  pathname: string,
): "guest" | "open" | "private" | null {
  if (pathname !== APP_HOME_PATH && !pathname.startsWith(`${APP_HOME_PATH}/`))
    return null;
  if (GUEST_PATHS.has(pathname)) return "guest";
  if (OPEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)))
    return "open";
  return "private";
}
