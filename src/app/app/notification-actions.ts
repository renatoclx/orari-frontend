"use server";

import { ApiError } from "@/services/api";
import { listMessages } from "@/services/app-push.service";
import { dismissProWelcome } from "@/services/app-pro-welcome.service";
import {
  clearProNotifications,
  deleteProPushSubscription,
  getProUnreadInfo,
  listProNotifications,
  markAllProNotificationsRead,
  markProNotificationRead,
  saveProNotificationPreferences,
  saveProPushSubscription,
} from "@/services/app-pro-notification.service";
import type { AppMessage, PushSubscriptionJson } from "@/types/client-app";
import type {
  AppNotification,
  NotificationPreference,
  UnreadInfo,
} from "@/types/notification";

// Server Actions das notificações do profissional no app.

export type ProActionResult = { ok: true } | { ok: false; message: string };

const isText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= max;

/** O número do sino; nulo se a API não respondeu (o sino mantém o anterior). */
export async function appProUnreadAction(): Promise<UnreadInfo | null> {
  try {
    return await getProUnreadInfo();
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) return null;
    throw error;
  }
}

/** Marca uma como lida; falha silenciosa: abrir o aviso não depende disso. */
export async function appProMarkReadAction(id: string): Promise<void> {
  if (!isText(id, 64)) return;
  try {
    await markProNotificationRead(id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

export async function appProMarkAllReadAction(): Promise<void> {
  try {
    await markAllProNotificationsRead();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

/** O push de cada categoria. */
export async function appProPreferencesAction(
  preferences: NotificationPreference[],
): Promise<ProActionResult> {
  if (!Array.isArray(preferences) || preferences.length > 20) {
    return { ok: false, message: "Não foi possível salvar." };
  }
  try {
    await saveProNotificationPreferences(
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

export async function appProPushSubscribeAction(
  subscription: PushSubscriptionJson,
): Promise<ProActionResult> {
  if (
    !isText(subscription?.endpoint, 1000) ||
    !subscription.endpoint.startsWith("https://") ||
    !isText(subscription.keys?.p256dh, 200) ||
    !isText(subscription.keys?.auth, 100)
  ) {
    return { ok: false, message: "Não foi possível ativar neste aparelho." };
  }
  try {
    await saveProPushSubscription({
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime ?? null,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function appProPushUnsubscribeAction(
  endpoint: string,
): Promise<ProActionResult> {
  if (!isText(endpoint, 1000)) return { ok: true };
  try {
    await deleteProPushSubscription(endpoint);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

/** Limpa a caixa do profissional. */
export async function appProClearAction(): Promise<void> {
  try {
    await clearProNotifications();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

/** Dispensa o cartão de boas-vindas do Início; falha silenciosa (o cartão volta se não gravou). */
export async function appProDismissWelcomeAction(): Promise<void> {
  try {
    await dismissProWelcome();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

/** As últimas notificações do profissional, para o aviso na tela. */
export async function appProRecentAction(): Promise<AppNotification[] | null> {
  try {
    return (await listProNotifications(1)).items;
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) return null;
    throw error;
  }
}

/**
 * O número de avisos do cliente e quando chegou o mais novo, no mesmo formato
 * do sino do profissional (a API do cliente não tem uma rota só para isso).
 */
export async function appUnreadMessagesAction(): Promise<UnreadInfo | null> {
  try {
    const page = await listMessages(1);
    return { unread: page.unread, latestAt: page.items[0]?.createdAt ?? null };
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) return null;
    throw error;
  }
}

/** Os últimos avisos do cliente, para o aviso na tela. */
export async function appRecentMessagesAction(): Promise<AppMessage[] | null> {
  try {
    return (await listMessages(10)).items;
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) return null;
    throw error;
  }
}
