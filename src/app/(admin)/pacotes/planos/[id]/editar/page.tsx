import type { Metadata } from "next";
import { PlanFormPage } from "@/components/plans/PlanFormPage";

export const metadata: Metadata = {
  title: "Alterar plano | Orari",
};

export default async function EditPlanRoute({
  params,
}: PageProps<"/pacotes/planos/[id]/editar">) {
  const { id } = await params;
  return <PlanFormPage id={id} />;
}
