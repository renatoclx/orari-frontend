"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, CheckCheck, ListChecks } from "lucide-react";
import { getOnboardingAction } from "@/app/(admin)/onboarding-actions";
import { showOnboarding } from "@/components/onboarding/onboarding";
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
import { useAnnounceNew } from "./useAnnounceNew";
import { useUnreadCount } from "./useUnreadCount";

/**
 * O sino do painel (screens/notificacoes.md): o número de não lidas numa
 * marca vermelha e, ao abrir, as últimas notificações. Tocar numa a marca como
 * lida e leva ao destino; "Ver todas" abre a página. Para o ADMIN, o rodapé
 * também reabre os primeiros passos enquanto faltarem (quem limpou a
 * notificação de boas-vindas não perde o caminho).
 */
export function NotificationBell({
  withOnboarding = false,
}: {
  withOnboarding?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [stepsLeft, setStepsLeft] = useState(false);
  const { count, latestAt, setCount, refresh } =
    useUnreadCount(unreadCountAction);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);
  // Chegou notificação nova com o painel aberto: aparece no toaster, além de
  // contar na lista. Agendamento novo (ex.: o cliente agendou pelo app) também
  // atualiza a tela atual, que pode ser a agenda.
  useAnnounceNew<AppNotification>({
    latestAt,
    fetchRecent: async () => (await recentNotificationsAction())?.items ?? null,
    onOpen: (item) => void openItem(item),
    onSeeAll: () => router.push("/notificacoes"),
    onNew: (added) => {
      if (added.some((item) => item.category === "APPOINTMENT")) {
        router.refresh();
      }
    },
  });

  // Ao abrir, busca as últimas (e confere o número junto).
  async function load() {
    setFailed(false);
    if (withOnboarding) {
      void getOnboardingAction().then((result) =>
        setStepsLeft(result.ok && showOnboarding(result.onboarding)),
      );
    }
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
    if (item.url) {
      // Já na tela do destino, o push não busca de novo: atualiza.
      const here = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
      if (item.url === here) router.refresh();
      else router.push(item.url);
    }
    void refresh();
  }

  // Abre o dialog na tela em que o usuário está (o host lê ?passos=1).
  function openOnboarding() {
    setOpen(false);
    const next = new URLSearchParams(searchParams.toString());
    next.set("passos", "1");
    router.push(`${pathname}?${next.toString()}`);
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
          {stepsLeft && (
            <button
              type="button"
              onClick={openOnboarding}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-control text-sm font-medium hover:bg-muted"
            >
              <ListChecks className="size-4" aria-hidden="true" />
              Primeiros passos
            </button>
          )}
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
