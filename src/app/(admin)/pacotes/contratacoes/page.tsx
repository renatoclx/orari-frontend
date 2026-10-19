import type { Metadata } from "next";
import { ClientPlansListPage } from "@/components/client-plans/ClientPlansListPage";

export const metadata: Metadata = {
  title: "Contratações | Orari",
};

export default async function ClientPlansPage({
  searchParams,
}: PageProps<"/pacotes/contratacoes">) {
  return <ClientPlansListPage searchParams={await searchParams} />;
}
