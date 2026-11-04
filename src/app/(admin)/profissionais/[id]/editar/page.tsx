import type { Metadata } from "next";
import { EditPersonPage } from "@/components/people/EditPersonPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";
import { requireFeature } from "@/lib/require-feature";

const kind = PEOPLE_KINDS.PROFESSIONAL;

export const metadata: Metadata = {
  title: `Alterar ${kind.singular} | Orari`,
};

export default async function EditProfessionalPage({
  params,
}: PageProps<"/profissionais/[id]/editar">) {
  await requireFeature("professionals", "edit");
  const { id } = await params;
  return <EditPersonPage kind={kind} id={id} />;
}
