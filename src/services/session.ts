import "server-only";

import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildSessionCookies,
} from "@/services/session-cookies";
import type { AuthTokens } from "@/types/auth";

// Ler funciona em qualquer código do servidor. Gravar e apagar só funciona em
// Server Actions e Route Handlers: as páginas não podem alterar cookies.

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function setSession(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  for (const cookie of buildSessionCookies(tokens)) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
