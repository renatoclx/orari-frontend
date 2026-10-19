import type { Metadata } from "next";
import { ClientHistoryPage } from "@/components/people/history/ClientHistoryPage";

export const metadata: Metadata = {
  title: "Histórico do cliente | Orari",
};

export default async function ClientHistoryRoute({
  params,
  searchParams,
}: PageProps<"/clientes/[id]">) {
  const { id } = await params;
  return <ClientHistoryPage id={id} searchParams={await searchParams} />;
}
