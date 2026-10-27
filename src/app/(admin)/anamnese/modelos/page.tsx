import type { Metadata } from "next";
import { TemplatesListPage } from "@/components/anamnesis/templates/TemplatesListPage";

export const metadata: Metadata = {
  title: "Modelos de ficha | Orari",
};

export default async function TemplatesPage({
  searchParams,
}: PageProps<"/anamnese/modelos">) {
  return <TemplatesListPage searchParams={await searchParams} />;
}
