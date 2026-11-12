import { NextResponse, type NextRequest } from "next/server";
import { isAuthGuardEnabled } from "@/lib/auth-guard";
import {
  FORWARDED_FOR_HEADER,
  clientIpFrom,
  forwardedForHeader,
} from "@/lib/client-ip";
import {
  APP_HOME_PATH,
  APP_LOGIN_PATH,
  appRouteKind,
  appSessionKind,
  proRouteAllowed,
} from "@/lib/app-routes";
import {
  APP_PRO_ACCESS_COOKIE,
  APP_PRO_REFRESH_COOKIE,
  APP_SESSION_COOKIE,
  buildAppProCookies,
} from "@/services/app-session-cookies";
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
  // App do cliente (/app): sessão própria, sem passar pelas regras da clínica.
  const appRoute = appRouteKind(request.nextUrl.pathname);
  if (appRoute) return guardAppRoute(request, appRoute);

  // Só para desenvolvimento: AUTH_GUARD=off desliga os redirecionamentos de
  // proteção (em produção a variável é ignorada). A renovação continua valendo.
  const guardEnabled = isAuthGuardEnabled(process.env);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && refreshToken) {
    // A API só enxerga o servidor do Next: sem o IP do usuário, o limite de
    // renovações valeria para todos juntos.
    const clientIp = clientIpFrom(request.headers.get(FORWARDED_FOR_HEADER));
    const result = await refreshOnce(refreshToken, clientIp);

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
function refreshOnce(
  refreshToken: string,
  clientIp: string | undefined,
): Promise<RefreshResult> {
  let refresh = refreshesInFlight.get(refreshToken);
  if (!refresh) {
    refresh = refreshSession(refreshToken, clientIp);
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
async function refreshSession(
  refreshToken: string,
  clientIp: string | undefined,
): Promise<RefreshResult> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...forwardedForHeader(clientIp),
      },
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

/**
 * Checagem otimista do app (cliente e profissional): só olha se os cookies
 * existem (quem valida o token é a API). Sem sessão, as telas de quem entrou
 * levam a entrar; entrado, entrar e criar conta levam ao Início.
 *
 * O profissional tem JWT de acesso (curto) e de renovação: quando o acesso
 * vence, o proxy renova aqui, como faz para a clínica, mas nos cookies do app.
 * E ele só abre as telas dele (`proRouteAllowed`): as do cliente voltam ao Início.
 */
async function guardAppRoute(
  request: NextRequest,
  route: "guest" | "open" | "private",
) {
  const clientToken = request.cookies.get(APP_SESSION_COOKIE)?.value;
  let proAccess = request.cookies.get(APP_PRO_ACCESS_COOKIE)?.value;
  let proRefresh = request.cookies.get(APP_PRO_REFRESH_COOKIE)?.value;
  let renewed: ReturnType<typeof buildAppProCookies> | null = null;
  let proEnded = false;

  if (!proAccess && proRefresh) {
    const clientIp = clientIpFrom(request.headers.get(FORWARDED_FOR_HEADER));
    const result = await refreshOnce(proRefresh, clientIp);
    if (result === "invalid") {
      proEnded = true;
      proRefresh = undefined;
    } else if (result !== "unavailable") {
      renewed = buildAppProCookies(result);
      proAccess = result.accessToken;
      proRefresh = result.refreshToken;
      // A página montada nesta mesma requisição lê os cookies da requisição.
      for (const cookie of renewed) {
        request.cookies.set(cookie.name, cookie.value);
      }
    }
    // API fora do ar: segue sem renovar; a tela mostra o erro de conexão.
  }

  const kind = appSessionKind({ clientToken, proAccess, proRefresh });
  let redirectTo: string | null = null;
  if (kind === null) {
    if (route === "private") redirectTo = APP_LOGIN_PATH;
  } else if (route === "guest") {
    redirectTo = APP_HOME_PATH;
  } else if (
    kind === "professional" &&
    !proRouteAllowed(request.nextUrl.pathname)
  ) {
    redirectTo = APP_HOME_PATH;
  }

  const response = redirectTo
    ? NextResponse.redirect(new URL(redirectTo, request.url))
    : NextResponse.next({ request: { headers: request.headers } });
  for (const cookie of renewed ?? []) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  if (proEnded) {
    response.cookies.delete(APP_PRO_ACCESS_COOKIE);
    response.cookies.delete(APP_PRO_REFRESH_COOKIE);
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

// Arquivos estáticos (logo, ícones do site e do app, fotos em /uploads) não passam pelo
// proxy: o navegador os pede antes do login e eles não podem redirecionar.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|logo/|uploads/|app-assets/).*)",
  ],
};
