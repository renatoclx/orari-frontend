import type { Metadata } from "next";
import { CompaniesListPage } from "@/components/companies/CompaniesListPage";

export const metadata: Metadata = {
  title: "Empresas | Orari",
};

export default async function CompaniesPage({
  searchParams,
}: PageProps<"/empresas">) {
  return <CompaniesListPage searchParams={await searchParams} />;
}
