import type { Metadata } from "next";
import { ServicesListPage } from "@/components/services/ServicesListPage";

export const metadata: Metadata = {
  title: "Serviços | Orari",
};

export default async function ServicesPage({
  searchParams,
}: PageProps<"/servicos">) {
  return <ServicesListPage searchParams={await searchParams} />;
}
