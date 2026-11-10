import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PayablesPage } from "@/components/payables/PayablesPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Contas a pagar | Orari",
};

// Financeiro → Contas a pagar: só o ADMIN, com a funcionalidade no plano.
export default async function PayablesRoute({
  searchParams,
}: PageProps<"/financeiro/contas-a-pagar">) {
  const user = await requireFeature("payables");
  if (user.type !== "ADMIN") notFound();
  return <PayablesPage searchParams={await searchParams} />;
}
