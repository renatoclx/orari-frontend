// Rotas do app do cliente (/app) e quem pode abrir cada uma (screens/app-cliente.md).
// Sem "server-only": o proxy usa.

export const APP_HOME_PATH = "/app";
export const APP_LOGIN_PATH = "/app/entrar";

// Só para quem não entrou: entrado, vai para o Início.
const GUEST_PATHS = new Set(["/app/entrar", "/app/criar-conta"]);
// Abertas com ou sem a conta entrada: o link de acesso, a página do
// estabelecimento (o endereço que a clínica divulga) e o manifesto, lido pelo
// celular ao instalar.
const OPEN_PREFIXES = [
  "/app/acesso/",
  "/app/local/",
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

/**
 * Quem está entrado no app: o cliente (cookie da conta) ou o profissional
 * (cookies de acesso e renovação do usuário só de app). Se os dois aparecerem
 * (só por cookie mexido à mão), vale o profissional, que é o mais restrito.
 */
export type AppSessionKind = "client" | "professional";

export function appSessionKind(cookies: {
  clientToken?: string;
  proAccess?: string;
  proRefresh?: string;
}): AppSessionKind | null {
  if (cookies.proAccess || cookies.proRefresh) return "professional";
  return cookies.clientToken ? "client" : null;
}

// O profissional só abre estas telas do app (o resto é do cliente). Cada
// etapa nova do app do profissional acrescenta as suas aqui.
const PROFESSIONAL_PATHS = new Set([
  "/app",
  "/app/agenda",
  "/app/menu",
  "/app/menu/senha",
  "/app/sessao-encerrada",
  "/app/manifest.webmanifest",
]);

/** O profissional pode abrir este caminho do app? Os demais voltam ao Início. */
export function proRouteAllowed(pathname: string): boolean {
  return PROFESSIONAL_PATHS.has(pathname.replace(/\/$/, "") || "/app");
}

/**
 * Para onde voltar depois de entrar ou criar a conta (`?voltar=`). Só aceita
 * um caminho do próprio app: um endereço de fora viraria um redirecionamento
 * para outro site.
 */
export function safeReturnPath(value: unknown): string | undefined {
  return typeof value === "string" &&
    value.startsWith(`${APP_HOME_PATH}/`) &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : undefined;
}
