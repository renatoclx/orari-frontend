import type { Metadata } from "next";
import { EditPersonPage } from "@/components/people/EditPersonPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";
import { requireFeature } from "@/lib/require-feature";

const kind = PEOPLE_KINDS.EMPLOYEE;

export const metadata: Metadata = {
  title: `Alterar ${kind.singular} | Orari`,
};

export default async function EditEmployeePage({
  params,
}: PageProps<"/funcionarios/[id]/editar">) {
  await requireFeature("employees", "edit");
  const { id } = await params;
  return <EditPersonPage kind={kind} id={id} />;
}
