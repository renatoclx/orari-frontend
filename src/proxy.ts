import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/services/session-cookies";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";

/**
 * Checagem otimista: olha só se os cookies existem. Quem valida o token de
 * verdade é a API; aqui o objetivo é não renderizar telas sem sessão.
 */
export function proxy(request: NextRequest) {
  // Só para desenvolvimento: AUTH_GUARD=off no .env.local libera a navegação
  // enquanto o login ainda não fala com a API. Sem a variável, a proteção vale.
  if (process.env.AUTH_GUARD === "off") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has(ACCESS_TOKEN_COOKIE) ||
    request.cookies.has(REFRESH_TOKEN_COOKIE);
  const isLoginPage = pathname === LOGIN_PATH;

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

// Arquivos estáticos (logo, ícones, imagens) não passam pelo proxy.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo/).*)"],
};
