import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientsReportPrintPage } from "@/components/clients-report/ClientsReportPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Perfil do cliente (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function ClientsReportPrintRoute({
  searchParams,
}: PageProps<"/relatorios/perfil-do-cliente/imprimir">) {
  const user = await requireFeature("clients-report");
  if (user.type !== "ADMIN") notFound();
  return <ClientsReportPrintPage searchParams={await searchParams} />;
}
