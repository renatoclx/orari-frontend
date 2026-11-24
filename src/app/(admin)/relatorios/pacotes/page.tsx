import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackagesReportPage } from "@/components/packages-report/PackagesReportPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Pacotes | Orari",
};

// Relatórios → Pacotes: só o ADMIN, com a funcionalidade no plano.
export default async function PackagesReportRoute({
  searchParams,
}: PageProps<"/relatorios/pacotes">) {
  const user = await requireFeature("packages-report");
  if (user.type !== "ADMIN") notFound();
  return <PackagesReportPage searchParams={await searchParams} />;
}
