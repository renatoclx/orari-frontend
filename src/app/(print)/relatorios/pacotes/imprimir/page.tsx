import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackagesReportPrintPage } from "@/components/packages-report/PackagesReportPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Pacotes (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function PackagesReportPrintRoute({
  searchParams,
}: PageProps<"/relatorios/pacotes/imprimir">) {
  const user = await requireFeature("packages-report");
  if (user.type !== "ADMIN") notFound();
  return <PackagesReportPrintPage searchParams={await searchParams} />;
}
