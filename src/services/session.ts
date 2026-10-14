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

/** Refresh token da sessão, usado para renovar o acesso. */
export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

/** Grava os cookies da sessão (só em Server Actions e Route Handlers). */
export async function setSession(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  for (const cookie of buildSessionCookies(tokens)) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }
}

/** Encerra a sessão apagando os cookies (só em Server Actions e Route Handlers). */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
