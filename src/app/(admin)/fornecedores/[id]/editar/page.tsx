import type { Metadata } from "next";
import { EditPersonPage } from "@/components/people/EditPersonPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";
import { requireFeature } from "@/lib/require-feature";

const kind = PEOPLE_KINDS.SUPPLIER;

export const metadata: Metadata = {
  title: `Alterar ${kind.singular} | Orari`,
};

export default async function EditSupplierPage({
  params,
}: PageProps<"/fornecedores/[id]/editar">) {
  await requireFeature("suppliers", "edit");
  const { id } = await params;
  return <EditPersonPage kind={kind} id={id} />;
}
