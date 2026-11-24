"use client";

import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";
import { announceNotificationsChanged } from "./useUnreadCount";

/**
 * A lista das páginas de notificações (painel e app). Tocar numa marca como
 * lida (`markRead`, a Server Action de quem usa) e leva ao destino; sem
 * destino, só atualiza a lista.
 */
export function NotificationList({
  items,
  markRead,
}: {
  items: AppNotification[];
  markRead: (id: string) => Promise<void>;
}) {
  const router = useRouter();

  async function open(item: AppNotification) {
    if (item.readAt === null) {
      await markRead(item.id);
      announceNotificationsChanged();
    }
    if (item.url) router.push(item.url);
    else router.refresh();
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
      {items.map((item) => (
        <li key={item.id}>
          <NotificationItem item={item} onOpen={open} />
        </li>
      ))}
    </ul>
  );
}
