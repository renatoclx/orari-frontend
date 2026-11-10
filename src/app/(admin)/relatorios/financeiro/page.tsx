import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinancialReportPage } from "@/components/financial-report/FinancialReportPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Financeiro | Orari",
};

// Relatórios → Financeiro: só o ADMIN, com a funcionalidade no plano.
export default async function FinancialReportRoute({
  searchParams,
}: PageProps<"/relatorios/financeiro">) {
  const user = await requireFeature("financial-report");
  if (user.type !== "ADMIN") notFound();
  return <FinancialReportPage searchParams={await searchParams} />;
}
