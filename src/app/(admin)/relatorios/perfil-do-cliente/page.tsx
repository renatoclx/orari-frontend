import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientsReportPage } from "@/components/clients-report/ClientsReportPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Perfil do cliente | Orari",
};

// Relatórios → Perfil do cliente: só o ADMIN, com a funcionalidade no plano.
export default async function ClientsReportRoute({
  searchParams,
}: PageProps<"/relatorios/perfil-do-cliente">) {
  const user = await requireFeature("clients-report");
  if (user.type !== "ADMIN") notFound();
  return <ClientsReportPage searchParams={await searchParams} />;
}
