"use client";

import { useRouter } from "next/navigation";
import {
  appProMarkReadAction,
  appProRecentAction,
  appProUnreadAction,
  appRecentMessagesAction,
  appUnreadMessagesAction,
} from "@/app/app/notification-actions";
import { useAnnounceNew } from "@/components/notifications/useAnnounceNew";
import { useUnreadCount } from "@/components/notifications/useUnreadCount";
import type { AppMessage } from "@/types/client-app";
import type { AppNotification } from "@/types/notification";

/**
 * Avisa no toaster do rodapé a notificação que chega com o app aberto, para o
 * profissional (as notificações dele) e para o cliente (a caixa de Avisos).
 * Fica no layout do app: vale em qualquer tela.
 */
export function AppNewNoticeToasts({
  kind,
}: {
  kind: "client" | "professional";
}) {
  return kind === "professional" ? <ProfessionalToasts /> : <ClientToasts />;
}

function ProfessionalToasts() {
  const router = useRouter();
  const { latestAt } = useUnreadCount(appProUnreadAction);
  useAnnounceNew<AppNotification>({
    latestAt,
    fetchRecent: appProRecentAction,
    onOpen: (item) => {
      void appProMarkReadAction(item.id);
      router.push(item.url ?? "/app/avisos");
    },
    onSeeAll: () => router.push("/app/avisos"),
    // Agendamento novo (o cliente agendou ou cancelou): a agenda aberta mostra.
    onNew: (added) => {
      if (added.some((item) => item.category === "APPOINTMENT")) {
        router.refresh();
      }
    },
  });
  return null;
}

function ClientToasts() {
  const router = useRouter();
  const { latestAt } = useUnreadCount(appUnreadMessagesAction);
  useAnnounceNew<AppMessage>({
    latestAt,
    fetchRecent: appRecentMessagesAction,
    // A caixa de Avisos marca como lidos ao abrir.
    onOpen: (item) => router.push(item.url ?? "/app/menu/avisos"),
    onSeeAll: () => router.push("/app/menu/avisos"),
  });
  return null;
}
