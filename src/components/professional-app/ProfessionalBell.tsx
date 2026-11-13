"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { appProUnreadAction } from "@/app/app/notification-actions";
import {
  badgeText,
  bellLabel,
} from "@/components/notifications/notification-format";
import { useUnreadCount } from "@/components/notifications/useUnreadCount";

/**
 * O sino do topo do app do profissional (screens/app-profissional.md): o
 * número de não lidas numa marca vermelha, e leva à página Avisos. `initial`
 * vem do servidor (o número já certo na primeira tela); depois o sino confere
 * sozinho a cada minuto e ao voltar para o app.
 */
export function ProfessionalBell({ initial }: { initial: number }) {
  const { count } = useUnreadCount(appProUnreadAction, initial);
  const text = badgeText(count);
  return (
    <Link
      href="/app/avisos"
      aria-label={bellLabel(count)}
      className="relative flex size-10 items-center justify-center rounded-control border border-border bg-card text-muted-foreground hover:text-foreground"
    >
      <Bell className="size-5" aria-hidden="true" />
      {text && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] leading-none font-bold text-background"
        >
          {text}
        </span>
      )}
    </Link>
  );
}
