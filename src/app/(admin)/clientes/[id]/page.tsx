import type { Metadata } from "next";
import { ClientHistoryPage } from "@/components/people/history/ClientHistoryPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Histórico do cliente | Orari",
};

export default async function ClientHistoryRoute({
  params,
  searchParams,
}: PageProps<"/clientes/[id]">) {
  await requireFeature("clients");
  const { id } = await params;
  return <ClientHistoryPage id={id} searchParams={await searchParams} />;
}
