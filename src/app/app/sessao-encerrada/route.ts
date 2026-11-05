import { NextResponse, type NextRequest } from "next/server";
import { APP_SESSION_COOKIE } from "@/services/app-session-cookies";

// Destino do appFetch quando a API recusa o token do app. Uma Route Handler
// pode apagar cookies (páginas não podem); depois leva a entrar com o aviso.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/app/entrar?expirou=1", request.url),
  );
  response.cookies.delete(APP_SESSION_COOKIE);
  return response;
}
