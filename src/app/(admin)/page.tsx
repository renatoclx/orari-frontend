import type { Metadata } from "next";
import { AgendaDayPage } from "@/components/agenda/AgendaDayPage";

export const metadata: Metadata = {
  title: "Agendamentos | Orari",
};

export default async function AgendaPage({ searchParams }: PageProps<"/">) {
  return <AgendaDayPage searchParams={await searchParams} />;
}
