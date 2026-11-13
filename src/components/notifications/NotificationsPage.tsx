import Link from "next/link";
import { BellOff } from "lucide-react";
import {
  clearNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(admin)/notification-actions";
import { AppPagination } from "@/components/professional-app/AppPagination";
import { pageCount } from "@/components/professional-app/professional-clients";
import { listNotifications } from "@/services/notification.service";
import { ClearNotificationsButton } from "./ClearNotificationsButton";
import { MarkAllReadButton } from "./MarkAllReadButton";
import { NotificationList } from "./NotificationList";

const TABS = [
  { id: "todas", label: "Todas" },
  { id: "nao-lidas", label: "Não lidas" },
] as const;

/**
 * Página Notificações do painel (screens/notificacoes.md): a caixa do usuário,
 * 10 por página, com o filtro de não lidas. O filtro e a página vão na URL.
 */
export async function NotificationsPage({
  onlyUnread,
  page,
}: {
  onlyUnread: boolean;
  page: number;
}) {
  const result = await listNotifications(page, onlyUnread);
  const href = (target: number) => {
    const params = new URLSearchParams();
    if (onlyUnread) params.set("filtro", "nao-lidas");
    if (target > 1) params.set("pagina", String(target));
    const query = params.toString();
    return query ? `/notificacoes?${query}` : "/notificacoes";
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            O que aconteceu na clínica e pede a sua atenção.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <MarkAllReadButton
            action={markAllNotificationsReadAction}
            disabled={result.unread === 0}
          />
          <ClearNotificationsButton
            action={clearNotificationsAction}
            disabled={result.items.length === 0}
          />
        </div>
      </div>

      <nav
        aria-label="Filtro"
        className="flex w-fit rounded-control bg-card p-1"
      >
        {TABS.map(({ id, label }) => {
          const active = (id === "nao-lidas") === onlyUnread;
          return (
            <Link
              key={id}
              href={
                id === "nao-lidas"
                  ? "/notificacoes?filtro=nao-lidas"
                  : "/notificacoes"
              }
              aria-current={active ? "page" : undefined}
              className={`rounded-control px-4 py-1.5 text-sm font-medium ${
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {id === "nao-lidas" && result.unread > 0 && ` (${result.unread})`}
            </Link>
          );
        })}
      </nav>

      {result.items.length > 0 ? (
        <>
          <NotificationList
            items={result.items}
            markRead={markNotificationReadAction}
          />
          <AppPagination
            page={page}
            pages={pageCount(result.total, result.limit)}
            href={href}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <BellOff
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-semibold">
            {onlyUnread
              ? "Nenhuma notificação não lida"
              : "Nenhuma notificação ainda"}
          </p>
          <p className="text-sm text-muted-foreground">
            {onlyUnread
              ? "Você está em dia."
              : "Os avisos aparecem aqui, por exemplo quando um cliente marca um horário pelo app."}
          </p>
        </div>
      )}
    </div>
  );
}
