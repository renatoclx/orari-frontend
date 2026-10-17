import type { Metadata } from "next";
import { RecurrenceDetailsPage } from "@/components/recurrences/RecurrenceDetailsPage";

export const metadata: Metadata = {
  title: "Recorrência | Orari",
};

export default async function RecurrenceRoute({
  params,
}: PageProps<"/recorrencias/[id]">) {
  const { id } = await params;
  return <RecurrenceDetailsPage id={id} />;
}
