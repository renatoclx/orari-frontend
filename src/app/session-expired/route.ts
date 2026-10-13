import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/services/session-cookies";

// Destino do apiFetch quando a API recusa o token. Uma Route Handler pode
// apagar cookies (páginas não podem); depois leva ao login com o aviso.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/login?expired=1", request.url),
  );
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
