import type { Metadata } from "next";
import { AnamnesisClientsPage } from "@/components/anamnesis/records/AnamnesisClientsPage";

export const metadata: Metadata = {
  title: "Fichas preenchidas | Orari",
};

export default async function AnamnesisClientsRoute({
  searchParams,
}: PageProps<"/anamnese/fichas">) {
  return <AnamnesisClientsPage searchParams={await searchParams} />;
}
