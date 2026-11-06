import "server-only";

import { appFetch } from "@/services/app-api";
import type {
  AppMessagesPage,
  PushInfo,
  PushPreferences,
  PushSubscriptionJson,
} from "@/types/client-app";

// Avisos do app (backend: /portal-account/push e /messages; screens/app-cliente.md).

export function getPushInfo(): Promise<PushInfo> {
  return appFetch<PushInfo>("/portal-account/push");
}

export function savePushSubscription(
  subscription: PushSubscriptionJson,
): Promise<void> {
  return appFetch<void>("/portal-account/push/subscriptions", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

export function deletePushSubscription(endpoint: string): Promise<void> {
  return appFetch<void>("/portal-account/push/subscriptions", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}

export function savePushPreferences(
  preferences: PushPreferences,
): Promise<PushPreferences> {
  return appFetch<PushPreferences>("/portal-account/push/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

/** Aviso de teste aos aparelhos da conta; `devices`: para quantos saiu. */
export function sendTestPush(): Promise<{ devices: number }> {
  return appFetch<{ devices: number }>("/portal-account/push/test", {
    method: "POST",
  });
}

export function listMessages(limit = 50): Promise<AppMessagesPage> {
  return appFetch<AppMessagesPage>(`/portal-account/messages?limit=${limit}`);
}

export function markMessagesRead(): Promise<void> {
  return appFetch<void>("/portal-account/messages/read", { method: "PATCH" });
}

/** Limpa a caixa de Avisos (apaga todos os avisos da conta). */
export function clearMessages(): Promise<void> {
  return appFetch<void>("/portal-account/messages", { method: "DELETE" });
}
