import type { Metadata } from "next";
import { PlanFormPage } from "@/components/plans/PlanFormPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Novo plano | Orari",
};

export default async function NewPlanRoute() {
  await requireFeature("plans", "create");
  return <PlanFormPage />;
}
