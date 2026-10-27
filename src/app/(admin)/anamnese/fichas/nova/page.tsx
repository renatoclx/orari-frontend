import type { Metadata } from "next";
import { NewAnamnesisPage } from "@/components/anamnesis/records/NewAnamnesisPage";

export const metadata: Metadata = {
  title: "Nova ficha | Orari",
};

export default async function NewAnamnesisRoute({
  searchParams,
}: PageProps<"/anamnese/fichas/nova">) {
  const { clienteId } = await searchParams;
  return (
    <NewAnamnesisPage
      clientId={typeof clienteId === "string" ? clienteId : undefined}
    />
  );
}
