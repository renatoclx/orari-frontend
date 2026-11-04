import type { Metadata } from "next";
import { RecurrencesListPage } from "@/components/recurrences/RecurrencesListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Recorrências | Orari",
};

export default async function RecurrencesPage({
  searchParams,
}: PageProps<"/recorrencias">) {
  await requireFeature("recurrences");
  return <RecurrencesListPage searchParams={await searchParams} />;
}
