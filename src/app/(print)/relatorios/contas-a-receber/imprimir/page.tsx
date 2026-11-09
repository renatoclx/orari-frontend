import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceivablesPrintPage } from "@/components/receivables/ReceivablesPrintPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Contas a receber (impressão) | Orari",
};

// Mesmo acesso da tela: só o ADMIN, com a funcionalidade no plano.
export default async function ReceivablesPrintRoute({
  searchParams,
}: PageProps<"/relatorios/contas-a-receber/imprimir">) {
  const user = await requireFeature("receivables");
  if (user.type !== "ADMIN") notFound();
  return <ReceivablesPrintPage searchParams={await searchParams} />;
}
