import "server-only";

import { apiFetch } from "@/services/api";
import type { NotificationsPage, UnreadInfo } from "@/types/notification";

// Notificações do usuário do painel (backend: /notifications). Cada um só lê e
// altera as próprias.

/** A caixa dele, das mais novas às mais antigas, com o total de não lidas. */
export function listNotifications(
  page: number,
  onlyUnread = false,
): Promise<NotificationsPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (onlyUnread) params.set("onlyUnread", "true");
  return apiFetch<NotificationsPage>(`/notifications?${params}`);
}

/** O número do sino e quando chegou a notificação mais nova. */
export function getUnreadInfo(): Promise<UnreadInfo> {
  return apiFetch<UnreadInfo>("/notifications/unread-count");
}

export function markNotificationRead(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>("/notifications/read-all", { method: "PATCH" });
}

/** Limpa a caixa: some da lista e do contador. */
export function clearNotifications(): Promise<void> {
  return apiFetch<void>("/notifications", { method: "DELETE" });
}
