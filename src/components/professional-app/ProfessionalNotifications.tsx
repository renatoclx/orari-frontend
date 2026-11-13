import Link from "next/link";
import { BellOff } from "lucide-react";
import {
  appProMarkAllReadAction,
  appProMarkReadAction,
} from "@/app/app/notification-actions";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { NotificationList } from "@/components/notifications/NotificationList";
import {
  getProNotificationPreferences,
  listProNotifications,
} from "@/services/app-pro-notification.service";
import { AppPagination } from "./AppPagination";
import { ProfessionalPushCard } from "./ProfessionalPushCard";
import { pageCount } from "./professional-clients";

const TABS = [
  { id: "todas", label: "Todas" },
  { id: "nao-lidas", label: "Não lidas" },
] as const;

/**
 * Avisos do profissional no app (screens/app-profissional.md): a caixa dele,
 * 10 por página, com o filtro de não lidas, e o card do aparelho com o que
 * vira push. Filtro e página vão na URL.
 */
export async function ProfessionalNotifications({
  onlyUnread,
  page,
}: {
  onlyUnread: boolean;
  page: number;
}) {
  const [result, prefs] = await Promise.all([
    listProNotifications(page, onlyUnread),
    getProNotificationPreferences(),
  ]);
  const href = (target: number) => {
    const params = new URLSearchParams();
    if (onlyUnread) params.set("filtro", "nao-lidas");
    if (target > 1) params.set("pagina", String(target));
    const query = params.toString();
    return query ? `/app/avisos?${query}` : "/app/avisos";
  };

  return (
    <>
      <h1 className="text-2xl font-semibold">Avisos</h1>

      <nav aria-label="Filtro" className="flex rounded-control bg-card p-1">
        {TABS.map(({ id, label }) => {
          const active = (id === "nao-lidas") === onlyUnread;
          return (
            <Link
              key={id}
              href={
                id === "nao-lidas"
                  ? "/app/avisos?filtro=nao-lidas"
                  : "/app/avisos"
              }
              aria-current={active ? "page" : undefined}
              className={`flex-1 rounded-control py-2 text-center text-sm font-medium ${
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
          <MarkAllReadButton
            action={appProMarkAllReadAction}
            disabled={result.unread === 0}
          />
          <NotificationList
            items={result.items}
            markRead={appProMarkReadAction}
          />
          <AppPagination
            page={page}
            pages={pageCount(result.total, result.limit)}
            href={href}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <BellOff
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-semibold">
            {onlyUnread ? "Nenhum aviso não lido" : "Nenhum aviso ainda"}
          </p>
          <p className="text-sm text-muted-foreground">
            {onlyUnread
              ? "Você está em dia."
              : "Quando um cliente marcar ou cancelar um horário seu pelo app, o aviso aparece aqui."}
          </p>
        </div>
      )}

      <ProfessionalPushCard
        publicKey={prefs.publicKey}
        preferences={prefs.preferences}
      />
    </>
  );
}
