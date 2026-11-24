import "server-only";

import { cookies } from "next/headers";
import { appSessionKind, type AppSessionKind } from "@/lib/app-routes";
import {
  APP_PRO_ACCESS_COOKIE,
  APP_PRO_REFRESH_COOKIE,
  APP_SESSION_COOKIE,
  buildAppProCookies,
  buildAppSessionCookie,
} from "@/services/app-session-cookies";
import type { AuthTokens } from "@/types/auth";
import type { AppSession } from "@/types/client-app";

// Sessão do app do cliente. Como na da clínica: ler funciona em qualquer código
// do servidor; gravar e apagar, só em Server Actions e Route Handlers.

export async function getAppToken(): Promise<string | undefined> {
  return (await cookies()).get(APP_SESSION_COOKIE)?.value;
}

export async function setAppSession(session: AppSession): Promise<void> {
  const store = await cookies();
  // Uma sessão por vez: entrar como cliente tira a de profissional.
  store.delete(APP_PRO_ACCESS_COOKIE);
  store.delete(APP_PRO_REFRESH_COOKIE);
  const cookie = buildAppSessionCookie(session);
  store.set(cookie.name, cookie.value, cookie.options);
}

export async function clearAppSession(): Promise<void> {
  (await cookies()).delete(APP_SESSION_COOKIE);
}

/** Quem entrou no app: o cliente, o profissional ou ninguém. */
export async function getAppSessionKind(): Promise<AppSessionKind | null> {
  const store = await cookies();
  return appSessionKind({
    clientToken: store.get(APP_SESSION_COOKIE)?.value,
    proAccess: store.get(APP_PRO_ACCESS_COOKIE)?.value,
    proRefresh: store.get(APP_PRO_REFRESH_COOKIE)?.value,
  });
}

/** Token de acesso do profissional (o proxy renova quando vence). */
export async function getAppProToken(): Promise<string | undefined> {
  return (await cookies()).get(APP_PRO_ACCESS_COOKIE)?.value;
}

export async function getAppProRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(APP_PRO_REFRESH_COOKIE)?.value;
}

/** Entra como profissional; sai a sessão de cliente, se houver (uma por vez). */
export async function setAppProSession(tokens: AuthTokens): Promise<void> {
  const store = await cookies();
  store.delete(APP_SESSION_COOKIE);
  for (const cookie of buildAppProCookies(tokens)) {
    store.set(cookie.name, cookie.value, cookie.options);
  }
}

export async function clearAppProSession(): Promise<void> {
  const store = await cookies();
  store.delete(APP_PRO_ACCESS_COOKIE);
  store.delete(APP_PRO_REFRESH_COOKIE);
}
