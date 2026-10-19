import type { Metadata } from "next";
import { PlanFormPage } from "@/components/plans/PlanFormPage";

export const metadata: Metadata = {
  title: "Novo plano | Orari",
};

export default function NewPlanRoute() {
  return <PlanFormPage />;
}
