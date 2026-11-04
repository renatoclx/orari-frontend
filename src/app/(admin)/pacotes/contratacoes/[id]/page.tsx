import type { Metadata } from "next";
import { ClientPlanDetailsPage } from "@/components/client-plans/ClientPlanDetailsPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Contratação | Orari",
};

export default async function ClientPlanRoute({
  params,
}: PageProps<"/pacotes/contratacoes/[id]">) {
  await requireFeature("contracts");
  const { id } = await params;
  return <ClientPlanDetailsPage id={id} />;
}
