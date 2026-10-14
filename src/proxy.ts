import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildSessionCookies,
} from "@/services/session-cookies";
import type { AuthTokens } from "@/types/auth";

// Caminhos usados nos redirecionamentos de proteção das rotas.
const LOGIN_PATH = "/login";
const HOME_PATH = "/";

/**
 * Roda antes de toda requisição. Duas tarefas:
 * 1. Renovar a sessão quando o access token venceu (o cookie some junto com ele).
 * 2. Checagem otimista das rotas: olha só se os cookies existem. Quem valida o
 *    token de verdade é a API.
 */
export async function proxy(request: NextRequest) {
  // Só para desenvolvimento: AUTH_GUARD=off desliga os redirecionamentos de
  // proteção. A renovação continua valendo.
  const guardEnabled = process.env.AUTH_GUARD !== "off";
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && refreshToken) {
    const result = await refreshOnce(refreshToken);

    if (result === "invalid") {
      return endSession(request, isLoginPage);
    }
    if (result !== "unavailable") {
      return continueWithTokens(request, result, isLoginPage && guardEnabled);
    }
    // API fora do ar: segue sem renovar; a tela mostra o erro de conexão.
  }

  if (!guardEnabled) {
    return NextResponse.next();
  }

  const hasSession = Boolean(accessToken || refreshToken);

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

// "invalid": a API recusou o refresh token; "unavailable": API fora do ar.
type RefreshResult = AuthTokens | "invalid" | "unavailable";

// Renovações em andamento, por refresh token. O Next pré-carrega várias telas
// ao mesmo tempo, e todas chegariam com o mesmo refresh token; como a rotação
// só aceita o primeiro uso, elas compartilham uma única chamada à API.
// Vale para uma instância do servidor (deploy atual).
const refreshesInFlight = new Map<string, Promise<RefreshResult>>();
// Janela em que o resultado fica disponível para quem chega logo depois.
const SHARED_RESULT_MS = 10_000;

// Uma renovação por refresh token, compartilhada entre as requisições simultâneas.
function refreshOnce(refreshToken: string): Promise<RefreshResult> {
  let refresh = refreshesInFlight.get(refreshToken);
  if (!refresh) {
    refresh = refreshSession(refreshToken);
    refreshesInFlight.set(refreshToken, refresh);
    // Mantém o resultado por alguns segundos para quem chegar logo depois.
    void refresh.finally(() =>
      setTimeout(
        () => refreshesInFlight.delete(refreshToken),
        SHARED_RESULT_MS,
      ),
    );
  }
  return refresh;
}

/**
 * Chama POST /auth/refresh. Exceção à regra dos services: o proxy não pode
 * importar "server-only", e o apiFetch lê cookies de um jeito que só funciona
 * em páginas e Server Actions.
 */
async function refreshSession(refreshToken: string): Promise<RefreshResult> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return "invalid";
    return (await response.json()) as AuthTokens;
  } catch {
    return "unavailable";
  }
}

/** Grava os tokens novos na requisição (para a página) e na resposta (para o navegador). */
function continueWithTokens(
  request: NextRequest,
  tokens: AuthTokens,
  redirectHome: boolean,
) {
  const cookies = buildSessionCookies(tokens);

  // A página montada nesta mesma requisição lê os cookies da requisição.
  for (const cookie of cookies) {
    request.cookies.set(cookie.name, cookie.value);
  }

  const response = redirectHome
    ? NextResponse.redirect(new URL(HOME_PATH, request.url))
    : NextResponse.next({ request: { headers: request.headers } });

  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

/** Sessão sem volta (refresh recusado): apaga os cookies e vai para o login. */
function endSession(request: NextRequest, isLoginPage: boolean) {
  const response = isLoginPage
    ? NextResponse.next()
    : NextResponse.redirect(new URL(LOGIN_PATH, request.url));

  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

// Arquivos estáticos (logo, ícones, fotos em /uploads) não passam pelo proxy.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo/|uploads/).*)"],
};
