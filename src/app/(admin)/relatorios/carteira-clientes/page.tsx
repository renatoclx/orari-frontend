import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientPortfolioPage } from "@/components/client-portfolio/ClientPortfolioPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Carteira de clientes | Orari",
};

// Relatórios → Carteira de clientes: só o ADMIN, com a funcionalidade no plano.
export default async function ClientPortfolioRoute({
  searchParams,
}: PageProps<"/relatorios/carteira-clientes">) {
  const user = await requireFeature("client-portfolio");
  // Mostra o faturamento: só o ADMIN (a API também recusa os demais).
  if (user.type !== "ADMIN") notFound();
  return <ClientPortfolioPage searchParams={await searchParams} />;
}
