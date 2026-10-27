import type { Metadata } from "next";
import { EntryFormPage } from "@/components/anamnesis/records/EntryFormPage";

export const metadata: Metadata = {
  title: "Novo acompanhamento | Orari",
};

export default async function NewEntryRoute({
  params,
}: PageProps<"/clientes/[id]/anamnese/[fichaId]/acompanhamento">) {
  const { id, fichaId } = await params;
  return <EntryFormPage clientId={id} id={fichaId} />;
}
