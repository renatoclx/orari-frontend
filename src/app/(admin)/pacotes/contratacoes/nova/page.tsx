import type { Metadata } from "next";
import { NewClientPlanPage } from "@/components/client-plans/NewClientPlanPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Nova contratação | Orari",
};

export default async function NewClientPlanRoute() {
  await requireFeature("contracts", "create");
  return <NewClientPlanPage />;
}
