import type { Metadata } from "next";
import { TemplateFormPage } from "@/components/anamnesis/templates/TemplateFormPage";

export const metadata: Metadata = {
  title: "Alterar modelo de ficha | Orari",
};

export default async function EditTemplateRoute({
  params,
}: PageProps<"/anamnese/modelos/[id]/editar">) {
  const { id } = await params;
  return <TemplateFormPage id={id} />;
}
