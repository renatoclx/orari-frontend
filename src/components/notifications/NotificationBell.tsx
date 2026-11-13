"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  clearNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  recentNotificationsAction,
  unreadCountAction,
} from "@/app/(admin)/notification-actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AppNotification } from "@/types/notification";
import { ClearNotificationsButton } from "./ClearNotificationsButton";
import { NotificationItem } from "./NotificationItem";
import { badgeText, bellLabel } from "./notification-format";
import { useUnreadCount } from "./useUnreadCount";

/**
 * O sino do painel (screens/notificacoes.md): o número de não lidas numa
 * marca vermelha e, ao abrir, as últimas notificações. Tocar numa a marca como
 * lida e leva ao destino; "Ver todas" abre a página.
 */
export function NotificationBell() {
  const router = useRouter();
  const { count, latestAt, setCount, refresh } =
    useUnreadCount(unreadCountAction);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);
  // A notificação mais nova que o painel já viu (indefinida até a primeira resposta).
  const seenRef = useRef<string | null | undefined>(undefined);

  // Chegou notificação nova com o painel aberto: aparece no toaster, além de
  // contar na lista. A primeira resposta só fixa o ponto de partida: o que já
  // estava lá não vira aviso. Quem compara é a data da mais nova, e não o
  // número: ler uma e chegar outra no mesmo intervalo também conta.
  useEffect(() => {
    if (latestAt === undefined) return;
    const seen = seenRef.current;
    seenRef.current = latestAt;
    if (seen === undefined || latestAt === null) return;
    if (seen !== null && latestAt <= seen) return;
    void announceNew(seen);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage à data da mais nova
  }, [latestAt]);

  async function announceNew(since: string | null) {
    const page = await recentNotificationsAction();
    if (!page) return;
    const fresh = page.items.filter(
      (item) =>
        item.readAt === null && (since === null || item.createdAt > since),
    );
    for (const item of fresh.slice(0, 3)) {
      toast.info(item.title, {
        description: item.body,
        duration: 10_000,
        action: { label: "Abrir", onClick: () => void openItem(item) },
      });
    }
    // Muitas de uma vez: um aviso só para o resto, em vez de uma pilha.
    if (fresh.length > 3) {
      toast.info(`Mais ${fresh.length - 3} notificações novas`, {
        action: {
          label: "Ver todas",
          onClick: () => router.push("/notificacoes"),
        },
      });
    }
  }

  // Ao abrir, busca as últimas (e confere o número junto).
  async function load() {
    setFailed(false);
    const page = await recentNotificationsAction();
    if (page) {
      setItems(page.items);
      setCount(page.unread);
    } else {
      setFailed(true);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void load();
  }

  async function openItem(item: AppNotification) {
    setOpen(false);
    if (item.readAt === null) {
      // O número cai na hora; a API confirma na próxima conferência.
      setCount((value) => Math.max(0, value - 1));
      await markNotificationReadAction(item.id);
    }
    if (item.url) router.push(item.url);
    void refresh();
  }

  async function markAll() {
    setItems(
      (list) =>
        list?.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        })) ?? list,
    );
    setCount(0);
    await markAllNotificationsReadAction();
    void refresh();
  }

  const text = badgeText(count);
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={bellLabel(count)}
          className="relative rounded-control p-2 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" aria-hidden="true" />
          {text && (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-background"
            >
              {text}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="font-semibold">Notificações</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAll}
            disabled={count === 0}
          >
            <CheckCheck aria-hidden="true" />
            Marcar todas como lidas
          </Button>
        </div>

        <div className="max-h-96 divide-y divide-border overflow-auto">
          {items === null && !failed && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Buscando…
            </p>
          )}
          {failed && (
            <p role="alert" className="px-4 py-6 text-center text-sm">
              Não foi possível carregar. Tente de novo em instantes.
            </p>
          )}
          {items?.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          )}
          {items?.map((item) => (
            <NotificationItem key={item.id} item={item} onOpen={openItem} />
          ))}
        </div>

        <div className="space-y-2 border-t border-border p-2">
          <Link
            href="/notificacoes"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center justify-center rounded-control text-sm font-medium hover:bg-muted"
          >
            Ver todas
          </Link>
          <ClearNotificationsButton
            action={clearNotificationsAction}
            disabled={items === null || items.length === 0}
            onCleared={() => {
              setItems([]);
              setCount(0);
            }}
            fullWidth
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
