import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientPortfolioPrintPage } from "@/components/client-portfolio/ClientPortfolioPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Carteira de clientes (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function ClientPortfolioPrintRoute({
  searchParams,
}: PageProps<"/relatorios/carteira-clientes/imprimir">) {
  const user = await requireFeature("client-portfolio");
  if (user.type !== "ADMIN") notFound();
  return <ClientPortfolioPrintPage searchParams={await searchParams} />;
}
