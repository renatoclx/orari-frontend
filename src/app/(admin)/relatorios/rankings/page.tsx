import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RankingsPage } from "@/components/rankings/RankingsPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Rankings | Orari",
};

// Relatórios → Rankings: só o ADMIN, com a funcionalidade no plano.
export default async function RankingsRoute({
  searchParams,
}: PageProps<"/relatorios/rankings">) {
  const user = await requireFeature("rankings");
  if (user.type !== "ADMIN") notFound();
  return <RankingsPage searchParams={await searchParams} />;
}
