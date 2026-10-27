import type { Metadata } from "next";
import { AnamnesisDetailPage } from "@/components/anamnesis/records/AnamnesisDetailPage";

export const metadata: Metadata = {
  title: "Ficha de anamnese | Orari",
};

export default async function AnamnesisDetailRoute({
  params,
}: PageProps<"/clientes/[id]/anamnese/[fichaId]">) {
  const { id, fichaId } = await params;
  return <AnamnesisDetailPage clientId={id} id={fichaId} />;
}
