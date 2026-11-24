import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinancialReportPrintPage } from "@/components/financial-report/FinancialReportPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Financeiro (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function FinancialReportPrintRoute({
  searchParams,
}: PageProps<"/relatorios/financeiro/imprimir">) {
  const user = await requireFeature("financial-report");
  if (user.type !== "ADMIN") notFound();
  return <FinancialReportPrintPage searchParams={await searchParams} />;
}
