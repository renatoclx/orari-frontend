import type { Metadata } from "next";
import { PlanFormPage } from "@/components/plans/PlanFormPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Alterar plano | Orari",
};

export default async function EditPlanRoute({
  params,
}: PageProps<"/pacotes/planos/[id]/editar">) {
  await requireFeature("plans", "edit");
  const { id } = await params;
  return <PlanFormPage id={id} />;
}
