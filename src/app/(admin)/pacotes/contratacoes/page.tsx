import type { Metadata } from "next";
import { ClientPlansListPage } from "@/components/client-plans/ClientPlansListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Contratações | Orari",
};

export default async function ClientPlansPage({
  searchParams,
}: PageProps<"/pacotes/contratacoes">) {
  await requireFeature("contracts");
  return <ClientPlansListPage searchParams={await searchParams} />;
}
