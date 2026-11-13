"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { appProUnreadAction } from "@/app/app/notification-actions";
import {
  badgeText,
  bellLabel,
} from "@/components/notifications/notification-format";
import { useUnreadCount } from "@/components/notifications/useUnreadCount";

/**
 * O sino do app do profissional (screens/app-profissional.md): só o ícone, com
 * o número de não lidas numa marca vermelha, e leva à página Avisos. `initial`
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
      className="relative flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
    >
      <Bell className="size-6" aria-hidden="true" />
      {text && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-background"
        >
          {text}
        </span>
      )}
    </Link>
  );
}

/**
 * O sino no topo das telas do app. No Início ele fica na linha da saudação
 * ("Olá Camila"), então a barra do topo some ali para não repetir.
 */
export function ProfessionalBellBar({ initial }: { initial: number }) {
  const pathname = usePathname();
  if (pathname === "/app") return null;
  return (
    <div className="-mt-4 -mb-4 flex justify-end">
      <ProfessionalBell initial={initial} />
    </div>
  );
}
