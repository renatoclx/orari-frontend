import type { Metadata } from "next";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Serviços | Orari",
};

export default async function ServicesPage({
  searchParams,
}: PageProps<"/servicos">) {
  await requireFeature("services");
  return <ServicesListPage searchParams={await searchParams} />;
}
