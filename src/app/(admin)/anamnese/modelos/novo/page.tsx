import type { Metadata } from "next";
import { TemplateFormPage } from "@/components/anamnesis/templates/TemplateFormPage";

export const metadata: Metadata = {
  title: "Novo modelo de ficha | Orari",
};

export default function NewTemplateRoute() {
  return <TemplateFormPage />;
}
