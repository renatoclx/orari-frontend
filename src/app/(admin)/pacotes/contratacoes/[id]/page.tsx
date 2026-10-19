import type { Metadata } from "next";
import { ClientPlanDetailsPage } from "@/components/client-plans/ClientPlanDetailsPage";

export const metadata: Metadata = {
  title: "Contratação | Orari",
};

export default async function ClientPlanRoute({
  params,
}: PageProps<"/pacotes/contratacoes/[id]">) {
  const { id } = await params;
  return <ClientPlanDetailsPage id={id} />;
}
