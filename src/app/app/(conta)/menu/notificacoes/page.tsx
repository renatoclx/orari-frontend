import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import { ProfessionalPushCard } from "@/components/professional-app/ProfessionalPushCard";
import { getProNotificationPreferences } from "@/services/app-pro-notification.service";
import { getAppSessionKind } from "@/services/app-session";

export const metadata: Metadata = { title: "Avisos no celular" };

/**
 * Menu → Avisos no celular (screens/app-profissional.md): ativar o aviso neste
 * aparelho e escolher o que também vira aviso no celular. Só o profissional a
 * abre (o cliente tem os avisos dele dentro do Menu).
 */
export default async function AppPushSettingsPage() {
  if ((await getAppSessionKind()) !== "professional") notFound();
  const prefs = await getProNotificationPreferences();
  return (
    <>
      <MenuSubpageHeader
        title="Avisos no celular"
        description="Ative neste aparelho e escolha o que também chega como aviso. As notificações ficam sempre no sino."
      />
      <ProfessionalPushCard
        publicKey={prefs.publicKey}
        preferences={prefs.preferences}
      />
    </>
  );
}
