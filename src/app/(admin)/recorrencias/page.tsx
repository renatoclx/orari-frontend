import type { Metadata } from "next";
import { RecurrencesListPage } from "@/components/recurrences/RecurrencesListPage";

export const metadata: Metadata = {
  title: "Recorrências | Orari",
};

export default async function RecurrencesPage({
  searchParams,
}: PageProps<"/recorrencias">) {
  return <RecurrencesListPage searchParams={await searchParams} />;
}
