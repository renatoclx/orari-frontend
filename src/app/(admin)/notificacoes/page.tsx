import type { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { parsePageParam } from "@/components/professional-app/professional-clients";

export const metadata: Metadata = { title: "Notificações" };

/**
 * Notificações do usuário do painel (screens/notificacoes.md). O filtro vem de
 * `?filtro=nao-lidas` e a página de `?pagina=`; valor inválido vale o padrão.
 */
export default async function NotificationsRoute({
  searchParams,
}: PageProps<"/notificacoes">) {
  const { filtro, pagina } = await searchParams;
  return (
    <NotificationsPage
      onlyUnread={filtro === "nao-lidas"}
      page={parsePageParam(pagina)}
    />
  );
}
