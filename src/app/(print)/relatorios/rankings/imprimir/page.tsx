import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RankingsPrintPage } from "@/components/rankings/RankingsPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Rankings (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function RankingsPrintRoute({
  searchParams,
}: PageProps<"/relatorios/rankings/imprimir">) {
  const user = await requireFeature("rankings");
  if (user.type !== "ADMIN") notFound();
  return <RankingsPrintPage searchParams={await searchParams} />;
}
