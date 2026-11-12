import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfessionalAgenda } from "@/components/professional-app/ProfessionalAgenda";
import { parseDayParam } from "@/components/professional-app/professional-agenda";
import { getAppSessionKind } from "@/services/app-session";

export const metadata: Metadata = { title: "Agenda" };

/**
 * Agenda do profissional (screens/app-profissional.md). Só ele a abre (o proxy
 * já desvia o cliente; a conferência aqui cobre qualquer caminho que escape).
 * O dia vem da URL (`?dia=AAAA-MM-DD`); valor inválido vale como hoje.
 */
export default async function AppAgendaPage({
  searchParams,
}: PageProps<"/app/agenda">) {
  if ((await getAppSessionKind()) !== "professional") notFound();
  const { dia } = await searchParams;
  return <ProfessionalAgenda day={parseDayParam(dia)} />;
}
