import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfessionalNotifications } from "@/components/professional-app/ProfessionalNotifications";
import { parsePageParam } from "@/components/professional-app/professional-clients";
import { getAppSessionKind } from "@/services/app-session";

export const metadata: Metadata = { title: "Avisos" };

/**
 * Avisos do profissional (screens/app-profissional.md). Só ele a abre (o
 * proxy já desvia o cliente, que tem os Avisos dentro do Menu). Filtro em
 * `?filtro=nao-lidas` e página em `?pagina=`; valor inválido vale o padrão.
 */
export default async function AppNoticesPage({
  searchParams,
}: PageProps<"/app/avisos">) {
  if ((await getAppSessionKind()) !== "professional") notFound();
  const { filtro, pagina } = await searchParams;
  return (
    <ProfessionalNotifications
      onlyUnread={filtro === "nao-lidas"}
      page={parsePageParam(pagina)}
    />
  );
}
