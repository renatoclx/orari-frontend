import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfessionalClients } from "@/components/professional-app/ProfessionalClients";
import { parsePageParam } from "@/components/professional-app/professional-clients";
import { getAppSessionKind } from "@/services/app-session";

export const metadata: Metadata = { title: "Clientes" };

/**
 * Meus clientes (screens/app-profissional.md). Só o profissional a abre (o
 * proxy já desvia o cliente; a conferência aqui cobre qualquer caminho que
 * escape). Busca em `?q=` e página em `?pagina=`; valor inválido vale como o padrão.
 */
export default async function AppClientsPage({
  searchParams,
}: PageProps<"/app/clientes">) {
  if ((await getAppSessionKind()) !== "professional") notFound();
  const { q, pagina } = await searchParams;
  return (
    <ProfessionalClients
      term={typeof q === "string" ? q.trim() : ""}
      page={parsePageParam(pagina)}
    />
  );
}
