import "server-only";

import { cookies } from "next/headers";
import {
  APP_SESSION_COOKIE,
  buildAppSessionCookie,
} from "@/services/app-session-cookies";
import type { AppSession } from "@/types/client-app";

// Sessão do app do cliente. Como na da clínica: ler funciona em qualquer código
// do servidor; gravar e apagar, só em Server Actions e Route Handlers.

export async function getAppToken(): Promise<string | undefined> {
  return (await cookies()).get(APP_SESSION_COOKIE)?.value;
}

export async function setAppSession(session: AppSession): Promise<void> {
  const cookie = buildAppSessionCookie(session);
  (await cookies()).set(cookie.name, cookie.value, cookie.options);
}

export async function clearAppSession(): Promise<void> {
  (await cookies()).delete(APP_SESSION_COOKIE);
}
