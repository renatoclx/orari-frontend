import type { Metadata } from "next";
import { NewRecurrencePage } from "@/components/recurrences/NewRecurrencePage";

export const metadata: Metadata = {
  title: "Nova recorrência | Orari",
};

export default function NewRecurrenceRoute() {
  return <NewRecurrencePage />;
}
