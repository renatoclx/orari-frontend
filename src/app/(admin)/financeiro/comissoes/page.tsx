import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommissionsPage } from "@/components/commissions/CommissionsPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Comissões | Orari",
};

// Financeiro → Comissões: só o ADMIN (remuneração), com a funcionalidade.
export default async function CommissionsRoute({
  searchParams,
}: PageProps<"/financeiro/comissoes">) {
  const user = await requireFeature("commissions");
  if (user.type !== "ADMIN") notFound();
  return <CommissionsPage searchParams={await searchParams} />;
}
