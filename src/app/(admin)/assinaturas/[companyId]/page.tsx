import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubscriptionFormPage } from "@/components/subscriptions/SubscriptionFormPage";
import { isUuid } from "@/lib/uuid";

export const metadata: Metadata = {
  title: "Assinatura | Orari",
};

export default async function SubscriptionRoute({
  params,
}: PageProps<"/assinaturas/[companyId]">) {
  const { companyId } = await params;
  // Endereço com id inválido: "não encontrada", sem chamar a API.
  if (!isUuid(companyId)) notFound();
  return <SubscriptionFormPage companyId={companyId} />;
}
