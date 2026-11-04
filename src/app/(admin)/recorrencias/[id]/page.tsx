import type { Metadata } from "next";
import { RecurrenceDetailsPage } from "@/components/recurrences/RecurrenceDetailsPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Recorrência | Orari",
};

export default async function RecurrenceRoute({
  params,
}: PageProps<"/recorrencias/[id]">) {
  await requireFeature("recurrences");
  const { id } = await params;
  return <RecurrenceDetailsPage id={id} />;
}
