import type { Metadata } from "next";
import { NotificationPreferencesPage } from "@/components/notifications/NotificationPreferencesPage";

export const metadata: Metadata = { title: "Avisos no celular" };

// Portal do cliente → Avisos no celular (screens/notificacoes.md). Vale para
// qualquer usuário do painel, sem depender de plano.
export default function NoticePreferencesRoute() {
  return <NotificationPreferencesPage />;
}
