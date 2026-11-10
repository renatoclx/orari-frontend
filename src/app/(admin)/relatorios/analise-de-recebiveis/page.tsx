import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceivablesPage } from "@/components/receivables/ReceivablesPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Análise de recebíveis | Orari",
};

// Relatórios → Análise de recebíveis: só o ADMIN, com a funcionalidade no plano.
export default async function ReceivablesRoute({
  searchParams,
}: PageProps<"/relatorios/analise-de-recebiveis">) {
  const user = await requireFeature("receivables");
  // Números financeiros da empresa: só o ADMIN (a API também recusa os demais).
  if (user.type !== "ADMIN") notFound();
  return <ReceivablesPage searchParams={await searchParams} />;
}
