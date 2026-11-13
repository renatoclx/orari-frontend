"use server";

import { ApiError } from "@/services/api";
import {
  clearNotifications,
  getUnreadInfo,
  saveNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";
import type {
  NotificationPreference,
  NotificationsPage,
  UnreadInfo,
} from "@/types/notification";

// Server Actions do sino do painel. O navegador não fala com a API (o token
// fica no cookie do servidor): o sino chama estas ações.

/** O número do sino e a notificação mais nova; nulo se a API não respondeu (o sino mantém o anterior). */
export async function unreadCountAction(): Promise<UnreadInfo | null> {
  try {
    return await getUnreadInfo();
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) return null;
    throw error;
  }
}

/** As últimas notificações, para a lista do sino. */
export async function recentNotificationsAction(): Promise<NotificationsPage | null> {
  try {
    return await listNotifications(1);
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) return null;
    throw error;
  }
}

/** Marca uma como lida; falha silenciosa: abrir o aviso não depende disso. */
export async function markNotificationReadAction(id: string): Promise<void> {
  if (typeof id !== "string" || id.length > 64) return;
  try {
    await markNotificationRead(id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  try {
    await markAllNotificationsRead();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

/** Limpa a caixa do usuário. */
export async function clearNotificationsAction(): Promise<void> {
  try {
    await clearNotifications();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

/** O push de cada categoria (só as do usuário). */
export async function saveNotificationPreferencesAction(
  preferences: NotificationPreference[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Array.isArray(preferences) || preferences.length > 20) {
    return { ok: false, message: "Não foi possível salvar." };
  }
  try {
    await saveNotificationPreferences(
      preferences.map(({ category, push }) => ({
        category,
        push: push === true,
      })),
    );
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
