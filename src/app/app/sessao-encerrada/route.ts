import { NextResponse, type NextRequest } from "next/server";
import {
  APP_PRO_ACCESS_COOKIE,
  APP_PRO_REFRESH_COOKIE,
  APP_SESSION_COOKIE,
} from "@/services/app-session-cookies";

// Destino do appFetch e do proFetch quando a API recusa o token do app. Uma Route Handler
// pode apagar cookies (páginas não podem); depois leva a entrar com o aviso.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/app/entrar?expirou=1", request.url),
  );
  response.cookies.delete(APP_SESSION_COOKIE);
  response.cookies.delete(APP_PRO_ACCESS_COOKIE);
  response.cookies.delete(APP_PRO_REFRESH_COOKIE);
  return response;
}
