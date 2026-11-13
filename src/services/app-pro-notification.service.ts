import "server-only";

import { cache } from "react";
import { proFetch } from "@/services/app-pro-api";
import type { PushSubscriptionJson } from "@/types/client-app";
import type {
  NotificationPreference,
  NotificationPreferences,
  NotificationsPage,
} from "@/types/notification";

// Notificações do profissional no app (backend: /notifications), com o token
// do app (nunca o da clínica).

export function listProNotifications(
  page: number,
  onlyUnread = false,
): Promise<NotificationsPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (onlyUnread) params.set("onlyUnread", "true");
  return proFetch<NotificationsPage>(`/notifications?${params}`);
}

/**
 * Quantas não lidas: o número do sino. O `cache` evita repetir a chamada quando
 * o layout e o Início pedem o número na mesma requisição.
 */
export const getProUnreadCount = cache(async (): Promise<number> => {
  const { unread } = await proFetch<{ unread: number }>(
    "/notifications/unread-count",
  );
  return unread;
});

export function markProNotificationRead(id: string): Promise<void> {
  return proFetch<void>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export function markAllProNotificationsRead(): Promise<void> {
  return proFetch<void>("/notifications/read-all", { method: "PATCH" });
}

/** O push de cada categoria e a chave pública (nula com o push desligado no servidor). */
export function getProNotificationPreferences(): Promise<NotificationPreferences> {
  return proFetch<NotificationPreferences>("/notifications/preferences");
}

export function saveProNotificationPreferences(
  preferences: NotificationPreference[],
): Promise<NotificationPreferences> {
  return proFetch<NotificationPreferences>("/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify({ preferences }),
  });
}

/** Ativa o push neste aparelho. */
export function saveProPushSubscription(
  subscription: PushSubscriptionJson,
): Promise<void> {
  return proFetch<void>("/notifications/push/subscriptions", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

/** Desativa o push neste aparelho. */
export function deleteProPushSubscription(endpoint: string): Promise<void> {
  return proFetch<void>("/notifications/push/subscriptions", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}
