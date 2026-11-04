import type { Metadata } from "next";
import { NewRecurrencePage } from "@/components/recurrences/NewRecurrencePage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Nova Recorrência | Orari",
};

export default async function NewRecurrenceRoute() {
  await requireFeature("recurrences", "create");
  return <NewRecurrencePage />;
}
