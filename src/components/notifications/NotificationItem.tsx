"use client";

import { CalendarDays } from "lucide-react";
import type { AppNotification } from "@/types/notification";
import { relativeTime } from "./notification-format";

/**
 * Uma notificação na lista (o sino e a página). A não lida tem o título em
 * destaque e uma marca à direita; tocar abre o destino (quem usa decide o que
 * fazer em `onOpen`).
 */
export function NotificationItem({
  item,
  onOpen,
}: {
  item: AppNotification;
  onOpen: (item: AppNotification) => void;
}) {
  const unread = item.readAt === null;
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarDays className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-sm">
        <span
          className={`block ${unread ? "font-semibold" : "text-muted-foreground"}`}
        >
          {item.title}
        </span>
        <span className="block text-muted-foreground">{item.body}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {relativeTime(item.createdAt)}
        </span>
      </span>
      {unread && (
        <>
          <span
            className="mt-2 size-2.5 shrink-0 rounded-full bg-primary"
            aria-hidden="true"
          />
          <span className="sr-only">Não lida</span>
        </>
      )}
    </button>
  );
}
